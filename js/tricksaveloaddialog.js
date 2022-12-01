/**
 * Dialog that guides the user through the saving/loading process for uploading or downloading content to/from TRICK Service.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
 * @param {Function} callback - Async Function to call after the analysis version will be selected. 
*/
function TrickSaveLoadDialog(template_element, trick_apis, graph, callback) {
	TrickDialog.call(this, template_element, trick_apis, graph);
	this.callback = callback;
};

TrickSaveLoadDialog.prototype = Object.create(TrickDialog.prototype);
TrickSaveLoadDialog.prototype.constructor = TrickSaveLoadDialog;
TrickDialog.callback = () => { return false };

/** @inheritDoc */
TrickSaveLoadDialog.prototype.onVersionSelected = async function (form) {
	TrickDialog.prototype.onVersionSelected.apply(this, arguments);

	var self = this;
	var $dialog_selector = $(this.dom);
	var versionId = $dialog_selector.find(":input[name=versionId]").val();

	// Show loading
	$dialog_selector.find(".modal-content").addClass("d-none");
	let $dialog_loading_panel = $dialog_selector.find("[data-role=loading]").removeClass("d-none");

	// Fetch assets from API
	if (typeof this.callback === 'function')
		await this.callback(this.trick_api, this.graph, versionId, () => { $dialog_loading_panel.closest(".modal").modal("hide"); });
	else $dialog_loading_panel.closest(".modal").modal("hide");

};