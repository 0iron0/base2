
var Rule = Base.extend({
	constructor: function(selector, binding) {
		// create the selector object
		selector = new Selector(selector);
		// create the binding
		if (typeof binding != "function") {
			binding = Binding.extend(binding);
		}
		// create the bind function
		var bound = {}; // don't bind more than once
		function bind(element) {
			var uid = assignID(element);
			if (!bound[uid]) {
				bound[uid] = true;
				binding(DOM.bind(element));
			}
		};
		// execution of this method is deferred until the DOMContentLoaded event
		this.apply = Call.defer(function() {
		  try {
		    var foundNodes = selector.exec(document);
		  } catch (ex) {
		    if (!instanceOf(ex, SyntaxError)) throw ex;
		    throw new SyntaxError(format("Selector is not supported by JSB (%1)",ex.message));
		  }
		  forEach (foundNodes, bind);
		});
		this.toString = partial(String, selector);
		this.apply();
	},
	
	apply: Undefined,
	
	refresh: function() {
		this.apply();
	}
});