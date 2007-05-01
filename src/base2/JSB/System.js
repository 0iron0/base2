
var System = new Base({
	ready: false,
	_deferred: new Array2,

	defer: function(method, rank) {
		// defers a method call until DOMContentLoaded
		var deferred = function() {
			if (System._deferred) {
				System._deferred.push(new Call(this, method, arguments, rank));				
			} else {
				method.apply(this, arguments);
			}
		};
		return deferred;
	},
	
	onload: function() {
		// call deferred calls
		if (!System.ready) {
			System.ready = true;
			DOM.bind(document);
			System._deferred.sort(function(a, b) {
				return a.rank - b.rank;
			});
			System._deferred.invoke("call");
			delete System._deferred;
			setTimeout(function() { // jump out of the current event
				EventTarget.dispatchEvent(document, "ready");
			}, 0);
		}
	}
});

// initialise the system
EventTarget.addEventListener(document, "DOMContentLoaded", System.onload);
