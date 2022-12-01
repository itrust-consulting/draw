/**
 * Factory for creating EdgeDialog instances.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
function EdgeDialogFactory(template_element) {
	this.template_element = template_element;
};

/**
 * Creates a new EdgeDialog instance.
 */
EdgeDialogFactory.prototype.create = function() {
	return new EdgeDialog(this.template_element);
};