
extend(EventTarget, {
	addEventListener: function(target, type, listener) {
		assert(arguments.length >= 3, "Not enough arguments.", SyntaxError);
		assert(!target.nodeType, "Invalid target.", TypeError);
		assertType(listener, "function");
		return base(this, arguments);
	},

	dispatchEvent: function(target, event) {
		assert(arguments.length >= 2, "Not enough arguments.", SyntaxError);
		return base(this, arguments);
	},

	removeEventListener: function(target, type, listener) {
		assert(arguments.length >= 3, "Not enough arguments.", SyntaxError);
		assertType(listener, "function");
		return base(this, arguments);
	}
});
