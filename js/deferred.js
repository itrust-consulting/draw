function Deferred() {
	this.asyncResolve = new AsyncCallback();
	this.asyncReject = new AsyncCallback();
};

function AsyncCallback() {
	this.callbacks = [];
	this.called = false;
	this.callee = undefined;
	this.callargs = [];
};

Deferred.prototype.resolve = function (/*args*/) {
	this.asyncReject.called = true;
	this.asyncResolve.invoke(null, arguments);
};

Deferred.prototype.resolveWith = function (sender, args) {
	this.asyncReject.called = true;
	this.asyncResolve.invoke(sender, args);
};

Deferred.prototype.reject = function (/*args*/) {
	this.asyncResolve.called = true;
	this.asyncReject.invoke(null, arguments);
};

Deferred.prototype.rejectWith = function (sender, args) {
	this.asyncResolve.called = true;
	this.asyncReject.invoke(sender, args);
};

Deferred.prototype.done = function (callback) {
	this.asyncResolve.register(callback);
	return this;
};

Deferred.prototype.fail = function (callback) {
	this.asyncReject.register(callback);
	return this;
};

Deferred.prototype.always = function (callback) {
	this.asyncResolve.register(callback);
	this.asyncReject.register(callback);
	return this;
};

AsyncCallback.prototype.register = function (callback) {
	if (this.called)
		callback.apply(this.callee, this.callargs);
	else
		this.callbacks.push(callback);
};

AsyncCallback.prototype.invoke = function (callee, args) {
	if (!this.called) {
		this.called = true;
		this.callee = callee;
		this.callargs = Array.prototype.slice(args);
		for (let callback of this.callbacks)
			callback.apply(callee, args);
	}
};
