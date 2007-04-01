
// A collection of Rule objects

var RuleList = Collection.extend({
	constructor: function(rules) {
		this.base(rules);
		this.globalize(); //-dean: make this optional
	},
	
	globalize: System.defer(function() {
		var COMMA = /\s*,\s*/;
		var ID = /^#[\w-]+$/;
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this, function(rule, selector) {
			// add all ID selectors to the global namespace
			forEach (selector.split(COMMA), function(selector) {
				if (ID.test(selector)) {
					var name = ViewCSS.toCamelCase(selector.slice(1));
					window[name] = Document.matchSingle(document, selector);
				}
			});
		});
	}, 10),
	
	refresh: function() {
		this.invoke("refresh");
	}
}, {
	Item: Rule
});
