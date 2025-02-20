/**
 * The TrickApi object connects to the TRICK Service API and retrieves or uploads content from/to a risk analysis.
 * @param {string} trick_api_base_url - The base URL where the TRICK Service API is located. Must end with a slash ("/").
 * @constructor
 */
function TrickApi(trick_api_base_url) {
	this.trick_api_base_url = trick_api_base_url;
};

/**
 * Gets a human-readable name that allows users to identify this API.
 * @returns {string} Returns a human-readable string.
 */
TrickApi.prototype.getName = function () {
	// Retrieve host name from URL
	return (/^(\w+:\/*)?([^/:]+)/.exec(this.trick_api_base_url) || [])[2];
};

TrickApi.prototype.invoke = function (method, relative_url, data, contentType, processData) {
	let self = this;
	let deferred = new Deferred();

	$.ajax({
		url: this.trick_api_base_url + relative_url,
		method: method,
		data: data,
		processData: processData === undefined || processData === null ? true : processData,
		contentType: contentType === undefined || contentType === null ? "application/json" : contentType,//@eom use contenttype instanced of datatype
		crossDomain: true,
		xhrFields: { withCredentials: true },
	})
		.done(function () { deferred.resolveWith(self, arguments); })
		.fail(function () { deferred.rejectWith(self, arguments); });
	return deferred;
};

TrickApi.prototype.invokeWithErrorHandling = function (method, relative_url, params) {
	let trick_api_base_url = this.trick_api_base_url;
	return this.invoke(method, relative_url, params).fail(function (jqXHR, textStatus, errorThrown) {
		if (jqXHR.status == 0)
			alert("Unable to connect to " + trick_api_base_url + ". Please make sure you have Internet connectivity.\nThis error can also occur if your browser blocks connections to public web services. In this case, consider launching this tool via the app launcher instead.");
		else
			alert("Error while calling API:\n(HTTP " + jqXHR.status + ")\n" + errorThrown);
	});
};

TrickApi.prototype.getCustomers = function () {
	return this.invokeWithErrorHandling("get", "data/customers", {});
}

TrickApi.prototype.getAnalyses = function (customer_id) {
	return this.invokeWithErrorHandling("get", "data/analysis/all", { customerId: customer_id });
}

TrickApi.prototype.getAnalysisVersions = function (customer_id, analysis_id) {
	return this.invokeWithErrorHandling("get", "data/analysis/versions", { customerId: customer_id, identifier: analysis_id })
}

TrickApi.prototype.getAssets = function (analysis_version_id) {
	return this.invokeWithErrorHandling("get", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/assets", {});
}

TrickApi.prototype.addAsset = function (analysis_version_id, name, type, description, selected) {
	return this.invoke("post", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/new-asset", { name: name, type: type, description: description, selected: selected }, "application/x-www-form-urlencoded");
}

TrickApi.prototype.updateAsset = function (analysis_version_id, id, name, type, description, selected) {
	return this.invoke("post", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/assets/" + encodeURIComponent(id), { name: name, type: type, description: description, selected: selected}, "application/x-www-form-urlencoded");
}

TrickApi.prototype.deleteAsset = function (analysis_version_id, id) {
	return this.invoke("delete", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/assets/" + encodeURIComponent(id), {});
}

TrickApi.prototype.getAssessments = function (analysis_version_id) {
	return this.invoke("get", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/assessments", {});
}

TrickApi.prototype.getAssetDependencies = function (analysis_version_id) {
	return this.invoke("get", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/dependency", {});
}

TrickApi.prototype.getSnapshot = function (analysis_version_id) {
	return this.invoke("get", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/dependency/json", {});
}

TrickApi.prototype.saveAssetDependencies = function (analysis_version_id, data) {
	return this.invoke("post", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/dependency", data);
}

TrickApi.prototype.savePicture = function (analysis_version_id, data) {
	return this.invoke("post", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/dependency/png", data, false, false);
}

TrickApi.prototype.saveSnapshot = function (analysis_version_id, data) {
	return this.invoke("post", "data/analysis/" + encodeURIComponent(analysis_version_id) + "/dependency/json", data, false, false);
}




