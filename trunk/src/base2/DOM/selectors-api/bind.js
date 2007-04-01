
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
