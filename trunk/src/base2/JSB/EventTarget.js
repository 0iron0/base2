
extend(EventTarget, {
	addEventListener: function(target, type, listener, capture) {
		// Allow elements to pick up document events (e.g. ondocumentclick).
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			listener = bind(listener, target);
			target = Traversal.getDocument(target);
		}
		// call the default method
		this.base(target, type, listener, capture);
	},
	
/*	dispatchEvent: function(target, event) { 
		// Allow the event to be a string identifying its type.
		if (typeof event == "string") {
			var type = event;
			var document = Traversal.getDocument(target);
			event = document.createEvent("Events");
			event.initEvent(type, false, false);
		}
		this.base(target, event);
	}, */

	removeEventListener: function(target, type, listener, capture) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getDocument(target);
		}
		this.base(target, type, listener, capture);
	}
});
