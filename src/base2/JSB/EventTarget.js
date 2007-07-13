
extend(EventTarget, {	
	addEventListener: function(target, type, listener, useCapture) {
		// allow elements to pick up document events (e.g. ondocumentclick)
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			listener = bind(listener, target);
			target = Traversal.getDocument(target);
		}
		// call the default method
		this.base(target, type, listener, useCapture);
	},

	removeEventListener: function(target, type, listener, useCapture) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getDocument(target);
		}
		this.base(target, type, listener, useCapture);
	}
});
