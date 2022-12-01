/**
 * Dialog for creating/editing an Error dialog. For now this error is limited to processing the imported excel file but can be used
 * for other purpose as well
 * @param {HTMLTemplateElement} template_element - An HTML <template> element for the dialog to create.
 */
function ErrorDialog(template_element, error_header) {
    this.dom = document.importNode(template_element.content.firstElementChild, true);
    document.body.appendChild(this.dom);
    let $modalError = $(this.dom);
    let $modalHeaderText = $(".modal-title", $modalError);
    $modalHeaderText.text(error_header);
};

/**
 * Shows the Error dialog for the given Error model.
 * @param {object} Error_model - A plain Javascript object holding the values of the Error model to display.
 */
ErrorDialog.prototype.show = function (Error_model) {
    let $modalError = $(this.dom);
    if (Error_model.msg)
        $(".modal-body small.text-muted", $modalError).text(Error_model.msg);
    else $(".modal-body small.text-muted", $modalError).text(Error_model);
    if (Error_model.title)
        $(".modal-title", $modalError).text(Error_model.title)
    $modalError.modal('show');
};

/**
 * Hides an destroys the dialog.
 */
ErrorDialog.prototype.close = function () {
    $(this.dom).modal("hide");
    // Dialog is destroyed automatically after it is hidden
}
