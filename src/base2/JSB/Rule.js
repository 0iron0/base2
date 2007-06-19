
var Rule = Base.extend({
	constructor: function(selector, binding) {
		// create the selector object
		this.selector = instanceOf(selector, Selector) ?
			selector : new Selector(selector);
		// create the binding
		if (typeof binding != "function") {
			binding = Binding.extend(binding);
		}
		// create the bind method
		var bound = {}; // don't bind more than once
		this.bind = function(element) {
			var uid = assignID(element);
			if (!bound[uid]) {
				bound[uid] = true;
				binding(DOM.bind(element));
			}
		};
		this.apply();
	},
	
	selector: null,
	
	apply: System.defer(function() {
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this.selector.exec(document), this.bind);
	}),
	
	bind: function(element) {
		// defined in the constructor function
	},
	
	refresh: function() {
		this.apply();
	},
	
	toString: function() {
		return String(this.selector);
	}
});
