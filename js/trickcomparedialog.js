/**
 * Dialog that guides the user through the process for comparing the estimations from TRICK Service and those resulting from dependencies.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
*/
function TrickCompareDialog(template_element, trick_apis, graph) {
	var self = this;
	TrickDialog.call(this, template_element, trick_apis, graph);
	$(this.dom).find("[data-role=form-compare]").submit(function(e) { 
		e.preventDefault();
		var result = $(self.dom).modal("hide").data("result");
		if (result.length == 0) {
			alert("Risk analysis is empty. Nothing to do.");
			return;
		}
		setTimeout(()=> self.exportReport(result), 1);
		setTimeout(()=> self.exportCSV(result), 500);
		return false; 
 } );
};

TrickCompareDialog.prototype = Object.create(TrickDialog.prototype);
TrickCompareDialog.prototype.constructor = TrickCompareDialog;

/** @inheritDoc */
TrickCompareDialog.prototype.onVersionSelected = function(form) {
	TrickDialog.prototype.onVersionSelected.apply(this, arguments);

	var self = this;
	var $dialog_selector = $(this.dom);
	var versionId = $dialog_selector.find(":input[name=versionId]").val();

	// Show loading
	var $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	var $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch assets from API
	this.trick_api.getAssessments(versionId).done(function(data) {
		$dialog_loading_panel.addClass("d-none");
		self.showComparePanel($dialog_selector, $dialog_panels, data);
	});
};

TrickCompareDialog.prototype.showComparePanel = function($dialog_selector, $dialog_panels, data) {
	var self = this;
	$dialog_selector.find("[data-role=save]").hide();
	$dialog_panels.filter("[data-role=form-compare]").removeClass("d-none");
	var $status = $dialog_panels.find("[data-role=compare-status]").text("Initialising ...");
	var $progress = $dialog_panels.find("[data-role=compare-progress]").css("width", 0);

	var worker = new Worker("js/worker/computeassessments.js");
	worker.addEventListener("message", function(event) {
		if ("status" in event.data)
			$status.text(event.data.status);
		if ("progress" in event.data) {
			$progress.css("width", (event.data.progress * 100) + "%");
			if (event.data.progress >= 1)
				$progress.removeClass("progress-bar-animated");
		}
		if ("result" in event.data)
			$dialog_selector.data("result", event.data.result).find("[data-role=save]").show();
	}, false);
	worker.postMessage({ command: "start", graph: self.graph.save(), assessments: data });
	$(this.dom).on("hidden.bs.modal", function() { worker.postMessage({ command: "stop" }); });
};

/**
 * Internal method called after the user clicked on the "save" button.
 * Allows the user to save the comparison results.
 * @private
 */
TrickCompareDialog.prototype.exportReport = function(result) {
	// Extract impacts
	var impacts = Object.keys(result[0].impacts);
	// Group by asset
	var results_grouped = {};
	var assets = {};
	for (var i = 0; i < result.length; i++) {
		var asset = result[i].asset;
		if (asset.id in results_grouped) {
			results_grouped[asset.id].push(result[i]);
		}
		else {
			assets[asset.id] = asset;
			results_grouped[asset.id] = [result[i]];
		}
	}
	// Sort assets by name
	var assetIds_sorted = Object.keys(assets).sort(function(a, b) {
		a = assets[a].name.toLowerCase();
		b = assets[b].name.toLowerCase();
		return (a > b) - (a < b);
	});

	// Generate HTML report
	var title = "Dependency report";
	var html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" /><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous"><title>' + escapeHtml(title) + '</title><style type="text/css">del{color:var(--red);margin-right:.5rem;}</style></head><body class="container my-4">';
	html += '<h1>' + escapeHtml(title) + '</h1>';
	html += '<p>This report shows the suggestions for the risk assessment resulting from the dependencies modelled using draw.trickservice.com.</p>';
	for (let j = 0; j < assetIds_sorted.length; j++) {
		var assetId = assetIds_sorted[j];

		html += '<h2>' + escapeHtml(assets[assetId].name) + '</h2>';
		html += '<table class="table table-sm table-striped"><thead><th>Scenario</th><th>Likelihood</th>';
		for (let i = 0; i < impacts.length; i++)
			html += '<th>' + escapeHtml(impacts[i]) + '</th>';
		html += '</thead><tbody>';
		var assessments = results_grouped[assetId];
		for (let i = 0; i < assessments.length; i++) {
			var assessment = assessments[i];
			html += '<tr><td>' + escapeHtml(assessment.scenario.name) + '</td>';
			html += outputCompare(assessment.likelihood, assessment.likelihood_new);
			for (var impactId in assessment.impacts)
				html += outputCompare(assessment.impacts[impactId], assessment.impacts_new[impactId]);
			html += '</tr>';
		}
		html += '</tbody></table>';
	}
	html += '</body></html>';

	// Provide it for saving
	var blob = new Blob([html], { 'type': 'text/html' });
	var url = window.URL.createObjectURL(blob);
	var a = document.createElement('a');
	document.body.appendChild(a);
	a.href = url;
	a.download = "report.html";
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(a.href);  
	}, 100);
};

TrickCompareDialog.prototype.exportCSV = function(result){
	// Extract impacts
	var impacts = Object.keys(result[0].impacts);
	// Group by asset
	var results_grouped = {};
	var assets = {};
	for (var i = 0; i < result.length; i++) {
		var asset = result[i].asset;
		if (asset.id in results_grouped) {
			results_grouped[asset.id].push(result[i]);
		}
		else {
			assets[asset.id] = asset;
			results_grouped[asset.id] = [result[i]];
		}
	}
	// Sort assets by name
	var assetIds_sorted = Object.keys(assets).sort(function(a, b) {
		a = assets[a].name.toLowerCase();
		b = assets[b].name.toLowerCase();
		return (a > b) - (a < b);
	});

	var textContent = "Asset,Scenario,Old Likelihood, New Likelihood," + printImact(impacts)+"\r\n";
	for (let j = 0; j < assetIds_sorted.length; j++) {
		var assetId = assetIds_sorted[j];
		var assessments = results_grouped[assetId];
		for (let i = 0; i < assessments.length; i++) {
			var assessment = assessments[i];
			textContent+= csvEscape(assets[assetId].name) + ","+csvEscape(assessment.scenario.name)+","+assessment.likelihood+","+assessment.likelihood_new;
			for (var impactId in assessment.impacts)
				textContent += ","+assessment.impacts[impactId]+","+assessment.impacts_new[impactId];
			textContent +="\r\n";
		}
	}

	var blob = new Blob([textContent], { 'type': 'text/csv' });
	var url = window.URL.createObjectURL(blob);
	var a = document.createElement('a');
	document.body.appendChild(a);
	a.href = url;
	a.download = "report.csv";
	a.click();
	setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(a.href);  
	}, 100);
	
};

function printImact(impacts){
	var content = "";
	for (let i = 0; i < impacts.length; i++)
		content+= (content.length === 0? "" : ",")+ "Old "+ impacts[i]+ ",New "+impacts[i];
	return content;
}
function csvEscape(value){
	return value.includes(",")? '"'+value+'"' : value;
}

function outputCompare(old_value, new_value) {
	if (old_value == new_value)
		return '<td>' + escapeHtml(old_value) + '</td>';

	var is_extreme = Math.abs(Math.log10(old_value/new_value)) >= 1;
	return '<td' + (is_extreme ? ' class="table-warning"' : '') + '><del>' + escapeHtml(old_value) + '</del><ins>' + escapeHtml(new_value) + '</ins></td>';
}
function escapeHtml(s) {
	if (typeof s !== "string") s = "" + s;
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}