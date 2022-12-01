/**
 * Dialog for creating/editing an asset.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
function AssetDialog(template_element) {
	this.dom = document.importNode(template_element.content.firstElementChild, true);
	document.body.appendChild(this.dom);
	// Iterate map of assets and add to the form select option value..
	var $dialog = $(this.dom).data("dialog", this);

	mapOfSupportedAssets.forEach((key, value) => {		
		$('#form_select_id', $dialog).append($('<option>', { value : key }).text(value));
		});	
		
};

/**
 * Shows the asset dialog for the given asset model.
 * @param {object} asset_model - A plain Javascript object holding the values of the asset model to display.
 */
AssetDialog.prototype.show = function(asset_model) {
	var $dialog = $(this.dom).data("dialog", this);

	// Load values into dialog
	$dialog.find(":input").each(function() {
		var value = asset_model && asset_model[this.name];
		$(this).val(value ? [value] : []);
	});


	// Show dialog
	$dialog.modal("show")
		.on("shown.bs.modal", function() {
			// Focus first textbox in dialog
			$dialog.find(":input:not(.close):visible:first").focus();
		})
		.on("hidden.bs.modal", function() {
			// Destroy dialog after it is hidden
			$dialog.remove();
		});
};

/**
 * Hides an destroys the dialog.
 */
AssetDialog.prototype.close = function() {
	$(this.dom).modal("hide");
	// Dialog is destroyed automatically after it is hidden
}
