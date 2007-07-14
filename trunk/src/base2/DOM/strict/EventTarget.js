
function validTarget(target) {
	return target == window || Traversal.isDocument(target) || Traversal.isElement(target);
};

EventTarget.implement({
	addEventListener: function(target, type, listener, useCapture) {
		assertArity(arguments);
		assert(validTarget(target), "Invalid target.", TypeError);
		assertType(listener.handleEvent || listener, "function");
		assertType(useCapture, "boolean");
		return base(this, arguments);
	},

	dispatchEvent: function(target, event) {
		assertArity(arguments);
		return base(this, arguments);
	},

	removeEventListener: function(target, type, listener, useCapture) {
		assertArity(arguments);
		assert(validTarget(target), "Invalid target.", TypeError);
		assertType(listener.handleEvent || listener, "function");
		assertType(useCapture, "boolean");
		return base(this, arguments);
	}
});
