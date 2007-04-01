
extend(EventTarget, {	
	addEventListener: function(target, type, listener, context) {
		// allow elements to pick up document events (e.g. ondocumentclick)
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			context = target;
			target = Traversal.getOwnerDocument(target);
		}
		// call the default method
		this.base(target, type, listener, context);
	},

	removeEventListener: function(target, type, listener) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getOwnerDocument(target);
		}
		this.base(target, type, listener);
	}
});

