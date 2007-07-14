
function assertTarget(target) {
	assert(target == window || Traversal.isDocument(target) || Traversal.isElement(target), "Invalid event target.", TypeError);
};

function strictEventListener(target, type, listener, capture) {
	assertArity(arguments);
	assertTarget(target);
	assertType(listener.handleEvent || listener, "function", "Invalid event listener.");
	assertType(capture, "boolean", "Invalid capture argument.");
	return base(this, arguments);
};

EventTarget.implement({
	addEventListener: strictEventListener,

	dispatchEvent: function(target, event) {
		assertArity(arguments);
		assertTarget(target);
		assert(event && event.type, "Invalid event object.", TypeError);
		return base(this, arguments);
	},

	removeEventListener: strictEventListener
});
