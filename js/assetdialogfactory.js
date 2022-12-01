/**
 * Factory for creating AssetDialog instances.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
function AssetDialogFactory(template_element) {
	this.template_element = template_element;
};

/**
 * Creates a new AssetDialog instance.
 */
AssetDialogFactory.prototype.create = function() {
	return new AssetDialog(this.template_element);
};