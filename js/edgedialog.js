/**
 * Dialog for editing properties of a graph edge.
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
function EdgeDialog(template_element) {
	this.dom = document.importNode(template_element.content.firstElementChild, true);
	document.body.appendChild(this.dom);
};

/**
 * Shows the edge dialog for the given edge data model.
 * @param {object} edge_data_model - A plain Javascript object holding the values of the edge data model to display.
 */
EdgeDialog.prototype.show = function(edge_data_model, source_node_name, target_node_name) {
	var $dialog = $(this.dom).data("dialog", this);

	// Load values into dialog
	$dialog.find(":input").each(function() {
		$(this).val(edge_data_model && edge_data_model[this.name] || "1");
	});

	$dialog.find("[data-role=source]").text(source_node_name);
	$dialog.find("[data-role=target]").text(target_node_name);

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
EdgeDialog.prototype.close = function() {
	$(this.dom).modal("hide");
	// Dialog is destroyed automatically after it is hidden
}
