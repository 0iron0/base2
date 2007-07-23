
// This object can be instantiated, however it is probably better to use
// the matchAll/matchSingle methods on DOM nodes.

// There is no public standard for this object. It just separates the NodeSelector
//  interface from the complexity of the Selector parsers.

var Selector = Base.extend({
	constructor: function(selector) {
		this.toString = partial(String, trim(selector));
	},
	
	exec: function(context, single) {
		try {
			var result = this.$evaluate(context || document, single);
		} catch (error) { // probably an invalid selector =)
			throw new SyntaxError(format("'%1' is not a valid CSS selector.", this));
		}
		return single ? result : new StaticNodeList(result);
	},
	
	test: function(element) {
		//-dean: improve this for simple selectors
		element.setAttribute("b2_test", true);
		var selector = new Selector(this + "[b2_test]");
		var result = selector.exec(Traversal.getOwnerDocument(element), true);
		element.removeAttribute("b2_test");
		return result == element;
	},
	
	$evaluate: function(context, single) {
		return Selector.parse(this)(context, single);
	}
});
