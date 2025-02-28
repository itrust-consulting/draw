/**
 * Dialog that guides the user through the synchronisation process for uploading or downloading content to/from TRICK Service.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
*/
function TrickSyncDialog(template_element, trick_apis, graph) {
	let self = this;
	TrickDialog.call(this, template_element, trick_apis, graph);
	$(this.dom).find("[data-role=form-sync]").submit(function(e) { e.preventDefault(); self.onSyncClicked(); return false; });
};

TrickSyncDialog.prototype = Object.create(TrickDialog.prototype);
TrickSyncDialog.prototype.constructor = TrickSyncDialog;

/** @inheritDoc */
TrickSyncDialog.prototype.onVersionSelected = function(form) {
	TrickDialog.prototype.onVersionSelected.apply(this, arguments);

	let self = this;
	let $dialog_selector = $(this.dom);
	let versionId = $dialog_selector.find(":input[name=versionId]").val();

	// Show loading
	let $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	let $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch assets from API
	this.trick_api.getAssets(versionId).done(function(data) {
		$dialog_loading_panel.addClass("d-none");
		self.showSyncPanel($dialog_selector, $dialog_panels, data);
	});
};

function _getDifference(array1, array2) 
{
	return array1.filter(object1 => {
	  return !array2.some(object2 => {
		return _compareAsset(object1, object2);
	  });
	});
}

function _removePreviousValFromSelectedList(selected_list, previous_val) {
	// remove previous_val from list_selected	
	for (let i =0; i<selected_list.length; i++) {
		if (selected_list[i] == previous_val) {
			selected_list.splice(i, 1);
			break;
		}
	}
};


TrickSyncDialog.prototype.showSyncPanel = function($dialog_selector, $dialog_panels, data) {
	let self = this;
	$dialog_panels.filter("[data-role=form-sync-x]").removeClass("d-none");

	// Sort assets by type and name.
	// This is mainly done for the case where an entire analysis is imported into an empty graph;
	// in that case we want similar assets to be added next to each other.
	// similar assets
	data.sort(function(a, b) {
		if (a.assetTypeName != b.assetTypeName)
			// First order by asset type
			return a.assetTypeName > b.assetTypeName ? -1 : 1;
		else
			// Then by name
			return (a.name < b.name) - (a.name > b.name);
	});

	// Get the asset names not already in TS but present in Graph
	assetNamesNotInTS = [];
	// This represents the selected/mapped list of assets in Graph
	selected_list = [];

	assetNamesNotInTS.push("-"); // Not set

	console.log(self.graph.cy.nodes());

	assetsNotInTS = _getDifference(self.graph.cy.nodes(), data);
	for (let i =0; i<assetsNotInTS.length; i++) {
		let assetObj = assetsNotInTS[i];
		if (assetObj.data("name") != undefined) {
			assetNamesNotInTS.push(assetObj.data("name"));
		}
	}
	assetNamesNotInTS = assetNamesNotInTS.sort();
	

	// Insert API data into DOM
	let $list_selector = $dialog_selector.find("[name=difflist]").empty();
	for (let i = 0; i < data.length; i++) {

		console.log(data[i]);

		let matches = self.graph.cy.nodes().filter(function(item) { return _compareAsset(item, data[i]); });
		// nodes do not match between graph and trick service
		if (matches.length == 0) {
			_makeDiffItem(null, data[i], assetNamesNotInTS, selected_list).appendTo($list_selector);
			continue;
		}
		let match = matches[0];
		match.data("trickId", data[i].id);
		if (match.data("name") != data[i].name || match.data("type") != data[i].assetTypeName || !!match.data("disabled") != !data[i].selected || match.data("comment") != data[i].comment) {
			_makeDiffItem(match, data[i], assetNamesNotInTS, selected_list).appendTo($list_selector);
			continue;
		}
	}
	self.graph.cy.nodes().forEach(function(item) {
		let found = null;
		for (let i = 0; found === null && i < data.length; i++)
			if (_compareAsset(item, data[i]))
				found = data[i];
		if (found === null)
			_makeDiffItem(item, null, assetNamesNotInTS, selected_list).appendTo($list_selector);
	});

	// Show or hide the sync button as appropriate
	if ($list_selector.children().length == 0) {
		$('<li class="list-group-item"/>').append('Everything synchronised with TRICK Service!').appendTo($list_selector);
		$dialog_selector.find("[name=syncButton]").hide();
	}
	else {
		$dialog_selector.find("[name=syncButton]").show();
	}
	$dialog_selector.find("[name=retryButton]").hide();
};

/**
 * Internal method called after the user clicked on the "sync" button.
 * Makes the requested changes in the graph or via the API.
 * @private
 */
TrickSyncDialog.prototype.onSyncClicked = function() {
	let self = this;
	let $modal_selector = $(this.dom);
	let $dialog_selector = $modal_selector;
	let versionId = $dialog_selector.find(":input[name=versionId]").val();
	$dialog_selector.find("[name=syncButton],[name=retryButton]").attr("disabled", true);

	// Use currently selected analysis as a basis for the default file name when saving
	this.graph.suggestDefaultFileName(
		$dialog_selector.find(":input[name=customerId] :selected").text() + "_" +
		$dialog_selector.find(":input[name=analysisId] :selected").text() + "_" +
		$dialog_selector.find(":input[name=versionId] :selected").text() + ".json");

	// Generate queue of synchronisation tasks
	let queue = $dialog_selector.find("[name=difflist]").children().map(function(i, list_item) {
		// Retrieve synchronisation information
		let $list_item = $(list_item);
		let $form = $list_item.find("form");
		let action = $form.find("[name=action]:checked").val();
		let asset_node = $form.data("asset_node");
		let trick_asset = $form.data("trick_asset");
		let merging_asset = "";

		if (action == "merge-tg") {
			let selected_asset = $form.find("[name=graph_exc_asset_names]").find(":selected").text();
			// Get the corresponding graph node from selected_asset
			merging_asset = self.graph.cy.nodes().filter(function(item) { return item.data("name") ==  selected_asset;});
		}

		// Show loading animation
		$form.removeClass("btn-group").html('<i class="fa fa-refresh fa-spin"></i>');

		return { $list_item: $list_item, $form: $form, action: action, asset_node: asset_node, trick_asset: trick_asset ,merging_asset: merging_asset};
	}).toArray();

	// Process the synchronisation queue
	function processQueue() {
		// Handle the end of the working queue
		if (queue.length == 0) {
			// Close dialog if no errors occurred
			if ($dialog_selector.find("[name=difflist] form").length == 0) {
				$dialog_selector.find("button").removeAttr("disabled");
				$modal_selector.modal("hide");
			}
			return;
		}

		// Retrieve synchronisation information
		let q = queue.shift();

		let done = function(data) {
			// Locally store object ID of asset in TRICK Service
			if (q.asset_node && data && data.id)
				q.asset_node.data("trickId", data.id);

			// Close dialog when last task is done
			q.$list_item.remove();
			setTimeout(processQueue, 0); // avoid recursion, which might cause stack overflows
		};
		let fail = function(jqXHR, textStatus, errorThrown) {
			if (!errorThrown) errorThrown = "Unable to connect to server.";
			if (jqXHR.status > 0) errorThrown += " (HTTP " + jqXHR.status + ")";
			$('<span class="text-danger"><i class="fa fa-exclamation-triangle"></i> Error</span>')
				.css("cursor", "help")
				.appendTo(q.$form.empty())
				.attr("title", "The changes could not be reflected in TRICK Service! " + errorThrown);
			$dialog_selector.find("[name=retryButton]").show().removeAttr("disabled").off("click").click(function() {
				$dialog_selector.find("button").removeAttr("disabled");
				self.onVersionSelected(null);
			});
			setTimeout(processQueue, 0); // avoid recursion, which might cause stack overflows
		};

		// Run action
		switch (q.action) {
			case "ins-ts": self.trick_api.addAsset(versionId, q.asset_node.data("name"), q.asset_node.data("type"), q.asset_node.data("comment"), !q.asset_node.data("disabled")).done(done).fail(fail); break;
			case "upd-ts": self.trick_api.updateAsset(versionId, q.trick_asset.id, q.asset_node.data("name"), q.asset_node.data("type"), q.asset_node.data("comment"), !q.asset_node.data("disabled")).done(done).fail(fail); break;
			case "del-ts": self.trick_api.deleteAsset(versionId, q.trick_asset.id).done(done).fail(fail); break;
			case "ins-gr": self.graph.addNode(null, q.trick_asset.name, q.trick_asset.assetTypeName, q.trick_asset.comment, !q.trick_asset.selected, q.trick_asset.id); done(); break;
			case "upd-gr": self.graph.addNode(q.asset_node.id(), q.trick_asset.name, q.trick_asset.assetTypeName, q.trick_asset.comment, !q.trick_asset.selected, q.trick_asset.id); done(); break;
			case "del-gr": self.graph.cy.remove(q.asset_node); done(); break;
			case "merge-tg": self.graph.addNode(q.merging_asset.id(), q.trick_asset.name, q.trick_asset.assetTypeName, q.trick_asset.comment, !q.trick_asset.selected, q.trick_asset.id); done(); break;
			default: done(); break;
		}
	};
	processQueue();
};

/**
 * Selects all radio buttons with [name=action] where [value] has the given suffix.
 * @param {string|JQuery} selector The selector of the container element for the radio buttons.
 * @param {string} action_suffix The suffix for the [value].
 */
TrickSyncDialog.selectAllActions = function(selector, action_suffix) {
	$(selector).find("[name=action][value$='" + action_suffix + "']").click();
};

/**
 * Compares a local asset (in the graph) with a remote graph (in TRICK Service).
 * @param {*} asset_node - An object describing the asset in the local graph.
 * @param {*} trick_asset - An object describing the asset in the remote TRICK API.
 * @returns {bool} Returns true iff both objects are considered to refer to the same asset.
 */
function _compareAsset(asset_node, trick_asset) {
	return asset_node.data("trickId") && asset_node.data("trickId") == trick_asset.id || asset_node.data("name") == trick_asset.name;
}

/**
 * Creates a list item that visualises the differences between the given local and remote asset descriptors.
 * @param {*} asset_node - An object describing the asset in the local graph.
 * @param {*} trick_asset - An object describing the asset in the remote TRICK API.
 * @param {*} assets_not_in_trick - Assets not present in Trick service but in local graph.
 * @returns {JQuery} Returns newly generated HTML (encapsulated in a JQuery selector) that visualises the differences.
 */
function _makeDiffItem(asset_node, trick_asset, assets_not_in_trick, selected_list) {
	let $btngroup = $('<form class="btn-group btn-group-toggle" data-toggle="buttons"/>').data("asset_node", asset_node).data("trick_asset", trick_asset);
	let diff_item_name = "";
	if (asset_node && trick_asset) {
		diff_item_name = trick_asset.name + " [" + trick_asset.assetTypeName + "] in TS ≠ " + asset_node.data("name") + " [" + asset_node.data("type") + "] in graph";
		$('<label class="mb-0 btn btn-sm btn-outline-primary"/>').text("Update in TS").append('<input type="radio" name="action" value="upd-ts" autocomplete="off"/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-secondary active"/>').text("Ignore").append('<input type="radio" name="action" value="ign" autocomplete="off" checked/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-primary"/>').text("Update in graph").append('<input type="radio" name="action" value="upd-gr" autocomplete="off"/>').appendTo($btngroup);
	}
	else if (asset_node) {
		diff_item_name = asset_node.data("name");
		$('<label class="mb-0 btn btn-sm btn-outline-success"/>').text("Add to TS").append('<input type="radio" name="action" value="ins-ts" autocomplete="off"/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-secondary active"/>').text("Ignore").append('<input type="radio" name="action" value="ign" autocomplete="off" checked/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-danger"/>').text("Delete from graph").append('<input type="radio" name="action" value="del-gr" autocomplete="off"/>').appendTo($btngroup);
	}
	else if (trick_asset) {
		diff_item_name = trick_asset.name;
		$('<label class="mb-0 btn btn-sm btn-outline-danger"/>').text("Delete from TS").append('<input type="radio" name="action" value="del-ts" autocomplete="off"/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-secondary active"/>').text("Ignore").append('<input type="radio" name="action" value="ign" autocomplete="off" checked/>').appendTo($btngroup);
		$('<label class="mb-0 btn btn-sm btn-outline-success"/>').text("Add to graph").append('<input type="radio" name="action" value="ins-gr" autocomplete="off"/>').appendTo($btngroup);
		let $mergelabel = $('<label class="mb-0 btn btn-sm btn-outline-info"/>').text("Merge with graph node").append('<input type="radio" name="action" value="merge-tg" autocomplete="off"/>').appendTo($btngroup);
		let $selectgroup = $('<select class="form-control" name="graph_exc_asset_names" id=' + trick_asset.name.replaceAll(' ', '-') + '_graph-exc-names data-prev="-"></select>');
		for (let i = 0; i < assets_not_in_trick.length; i++)
		{
			$selectgroup.append($('<option>',
			{
				value: i,
				text : assets_not_in_trick[i] 
			}));
		}
		$selectgroup.appendTo($mergelabel);	
		$selectgroup.on("focus", function() {
			this.dataset.prev = this.value;
		}).on("change", function() {
			_removePreviousValFromSelectedList(selected_list, this.dataset.prev);
			selected_list.push(this.value);
			
			let op = this.getElementsByTagName("option");
			for (let i = 0; i < op.length; i++) {
				if (op[i].value == this.dataset.prev) {
					op[i].disabled = false;
				}
			}
			this.dataset.prev = this.value;

			$selectors = $("select[name='graph_exc_asset_names'][id!='"+this.id+"']");
			$selectors.each(function(index, element) {
				let op = this.getElementsByTagName("option");
				for (let i = 0; i < op.length; i++) {
					// disable all elements from list_selected
					 op[i].disabled = false;
					 for (let j=0; j<selected_list.length; j++) {
						 if (op[i].value == selected_list[j]) {
							 op[i].disabled = true;
						 }
					 }
				 }
			});
			
		});
	}	
	return $('<li class="list-group-item d-flex"/>').append($('<div/>').css("flex-grow", "1").text(diff_item_name)).append($btngroup);
}

