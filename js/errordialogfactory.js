/**
 * Factory for creating ErrorDialog instances.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
 function ErrorDialogFactory(template_element) {
	this.template_element = template_element;
};

/**
 * Creates a new ErrorDialog instance.
 */
ErrorDialogFactory.prototype.create = function(error_header) {
	return new ErrorDialog(this.template_element, error_header);
};