/**
 * Dialog that guides the user through a process involving the TRICK API.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
*/
function TrickDialog(template_element, trick_apis, graph) {
	this.dom = document.importNode(template_element.content.firstElementChild, true);
	document.body.appendChild(this.dom);
	this.trick_apis = trick_apis;
	this.trick_api = null; // will be selected among trick_apis (cf. onInit())
	this.graph = graph;

	var self = this;
	$(this.dom).find("[data-role=form-customer]").submit(function(e) { e.preventDefault(); self.onCustomerSelected(this); return false; });
	$(this.dom).find("[data-role=form-analysis]").submit(function(e) { e.preventDefault(); self.onAnalysisSelected(this); return false; });
	$(this.dom).find("[data-role=form-version]").submit(function(e) { e.preventDefault(); self.onVersionSelected(this); return false; });
	//$(this.dom).find("[data-role=form-sync]").submit(function(e) { e.preventDefault(); self.onSyncClicked(); return false; });
};

TrickDialog.remembered_customer = null;
TrickDialog.remembered_analysis = null;
TrickDialog.remembered_version = null;

/**
 * Shows the asset dialog for the given asset model.
 * @param {object} asset_model - A plain Javascript object holding the values of the asset model to display.
 */
TrickDialog.prototype.show = function() {
	var self = this;
	var $dialog = $(this.dom).data("dialog", this);

	// Show dialog
	$dialog.modal("show")
		.on("shown.bs.modal", function() {
			self.onInit();
		})
		.on("hidden.bs.modal", function() {
			// Destroy dialog after it is hidden
			$dialog.remove();
		});
};

/**
 * Internal method called after the dialog has been initialized.
 * Displays the API selection interface.
 * @private
 */
TrickDialog.prototype.onInit = function() {
	var self = this;
	var $dialog_selector = $(this.dom);

	// If there is only one API to select from, don't show the API selection screen
	if (this.trick_apis.length == 1) {
		this.trick_api = this.trick_apis[0];
		this.onApiSelected();
		return;
	}

	// Show API picker
	var $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	$dialog_panels.filter("[data-role=apipicker]").removeClass("d-none");

	// Fill in APIs
	var $apis_selector = $("[data-role=apis]").empty();
	for (var i = 0; i < this.trick_apis.length; i++) {
		$("<button type='button'/>")
			.data("api", this.trick_apis[i])
			.addClass("btn btn-outline-primary mb-2")
			.text(this.trick_apis[i].getName())
			.appendTo($apis_selector).click(function() {
				self.trick_api = $(this).data("api");
				self.onApiSelected();
			});
	}
};

/**
 * Internal method called after the user has selected an API.
 * Displays the first form (select a customer).
 * @private
 */
TrickDialog.prototype.onApiSelected = function() {
	var self = this;
	var $dialog_selector = $(this.dom);

	// Show loading
	var $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	var $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch customers from API
	this.trick_api.getCustomers().done(function(data) {
		$dialog_loading_panel.addClass("d-none");
		self.showCustomerSelection($dialog_selector, $dialog_panels, data);
	});
};

TrickDialog.prototype.showCustomerSelection = function($dialog_selector, $dialog_panels, data) {
	$dialog_panels.filter("[data-role=form-customer]").removeClass("d-none");

	// Insert API data into DOM
	var $select_selector = $dialog_selector.find(":input[name=customerId]").empty();
	for (var i = 0; i < data.length; i++) {
		$("<option/>").attr("value", data[i].id).text(data[i].name).appendTo($select_selector);
	}

	// Pre-select remembered choice
	if (TrickDialog.remembered_customer)
		$select_selector.val([TrickDialog.remembered_customer]);
}

/**
 * Internal method called after a customer has been selected by the user.
 * Displays the second form (select an analysis).
 * @param {HTMLElement} form - The form that got submitted.
 * @private
 */
TrickDialog.prototype.onCustomerSelected = function(form) {
	var self = this;
	var $dialog_selector = $(this.dom);
	var $form = $(form);
	var customerId = $form.find(":input[name=customerId]").val();
	TrickDialog.remembered_customer = customerId; // remember choice

	// Show loading
	var $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	var $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch analyses from API
	this.trick_api.getAnalyses(customerId).done(function(data) {
		$dialog_loading_panel.addClass("d-none");
		self.showAnalysisSelection($dialog_selector, $dialog_panels, data);
	});
};

TrickDialog.prototype.showAnalysisSelection = function($dialog_selector, $dialog_panels, data) {
	$dialog_panels.filter("[data-role=form-analysis]").removeClass("d-none");

	// Insert API data into DOM
	var $select_selector = $dialog_selector.find(":input[name=analysisId]").empty();
	for (var i = 0; i < data.length; i++) {
		$("<option/>").attr("value", data[i].id).text(data[i].name).appendTo($select_selector);
	}

	// Pre-select remembered choice
	if (TrickDialog.remembered_analysis)
		$select_selector.val([TrickDialog.remembered_analysis]);
};

/**
 * Internal method called after an analysis has been selected by the user.
 * Displays the third form (select an analysis version).
 * @param {HTMLElement} form - The form that got submitted.
 * @private
 */
TrickDialog.prototype.onAnalysisSelected = function(form) {
	var self = this;
	var $dialog_selector = $(this.dom);
	var $form = $(form);
	var customerId = $dialog_selector.find(":input[name=customerId]").val();
	var analysisId = $dialog_selector.find(":input[name=analysisId]").val();
	TrickDialog.remembered_analysis = analysisId; // remember choice

	// Show loading
	var $dialog_panels = $dialog_selector.find(".modal-content").addClass("d-none");
	var $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch analysis versions from API
	this.trick_api.getAnalysisVersions(customerId, analysisId).done(function(data) {
		$dialog_loading_panel.addClass("d-none");
		self.showVersionSelection($dialog_selector, $dialog_panels, data);
	});
};

TrickDialog.prototype.showVersionSelection = function($dialog_selector, $dialog_panels, data) {
	$dialog_panels.filter("[data-role=form-version]").removeClass("d-none");

	// Insert API data into DOM (in reverse order, so that most recent version shows up first)
	var $select_selector = $dialog_selector.find(":input[name=versionId]").empty();
	for (var i = data.length - 1; i >= 0; i--) {
		$("<option/>").attr("value", data[i].id).text(data[i].name).appendTo($select_selector);
	}

	// Pre-select remembered choice
	if (TrickDialog.remembered_version)
		$select_selector.val([TrickDialog.remembered_version]);
};

/**
 * Internal method called after an analysis version has been selected by the user.
 * Displays the fourth form (synchronise).
 * @param {HTMLElement} form - The form that got submitted.
 * @private
 */
TrickDialog.prototype.onVersionSelected = function(form) {
	var versionId = $(this.dom).find(":input[name=versionId]").val();
	TrickDialog.remembered_version = versionId; // remember choice
};
