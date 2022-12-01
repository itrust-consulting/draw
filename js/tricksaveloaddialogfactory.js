/**
 * Factory for creating TrickSaveLoadDialog instances.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 * @param {TrickApi[]} trick_apis - An array of available TrickApi instances, each of which is able to connect to the TRICK Service API.
 */
function TrickSaveLoadDialogFactory(template_element, trick_apis) {
	this.template_element = template_element;
	this.trick_apis = trick_apis;
};

/**
 * Creates a new TrickSaveLoadDialog instance.
 * @param {DependencyGraph} graph - An instance of the asset graph that shall be synchronised with the API.
 * @param {Function} callback - Function to call after the analysis version will be selected. 
 */
TrickSaveLoadDialogFactory.prototype.create = function(graph, callback) {
	return new TrickSaveLoadDialog(this.template_element, this.trick_apis, graph, callback);
};