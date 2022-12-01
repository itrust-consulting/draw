/**
 * Factory for creating TrickCompareDialog instances.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 */
function TrickCompareDialogFactory(template_element, trick_apis) {
	this.template_element = template_element;
	this.trick_apis = trick_apis;
};

/**
 * Creates a new TrickCompareDialog instance.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
 */
TrickCompareDialogFactory.prototype.create = function(graph) {
	return new TrickCompareDialog(this.template_element, this.trick_apis, graph);
};