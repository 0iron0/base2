
// http://www.w3.org/TR/selectors-api/

var NodeSelector = Interface.extend({
	"@!(element.matchSingle)": { // future-proof
		matchAll: function(node, selector) {
			return new Selector(selector).exec(node);
		},
		
		matchSingle: function(node, selector) {
			return new Selector(selector).exec(node, 1);
		}
	}
});

// automatically bind objects retrieved using the Selectors API

extend(NodeSelector.prototype, {
	matchAll: function(selector) {
		return extend(this.base(selector), "item", function(index) {
			return _bind(this.base(index));
		});
	},
	
	matchSingle: function(selector) {
		return _bind(this.base(selector));
	}
});
