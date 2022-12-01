/**
 * The History object maintains a list of undo-able actions.
 * @param {number} size - The number of history items to be saved.
 * @constructor
 */
function History(size) {
	this.stack = [];
	this.size = size;
	this.index = -1;
	this.disabled = false;
};

History.prototype.add = function(state) {
	if (this.disabled) return;

	// Special case: if the new entry is exactly the same than the one before, ignore it
	if (this.stack.length > 0 && this.stack[this.index] == state) return;

	// Remove all more recent items (all redo-able actions will be lost)
	this.stack.splice(this.index + 1);
	// Add new state
	this.stack.push(state);
	// Remove old history items
	if (this.stack.length > this.size) {
		this.stack.splice(0, this.stack.length - this.size);
	}
	// In either case, the index always points at the last element on the stack
	this.index = this.stack.length - 1;
};

History.prototype.disable = function() {
	this.disabled = true;
};

History.prototype.enable = function() {
	this.disabled = false;
};

History.prototype.canUndo = function() {
	return this.index >= 0;
};

History.prototype.canRedo = function() {
	return this.index + 1 < this.stack.length;
};

History.prototype.undo = function() {
	// Move pointer backwards if possible
	if (this.index > 0)
		return this.stack[--this.index];
	// If not, then we reached the end of history
	else
		return undefined;
};

History.prototype.redo = function() {
	// Move pointer forwards if things remain on the stack *after* the pointer
	if (this.index + 1 < this.stack.length)
		return this.stack[++this.index];
	else
		return undefined;
};
