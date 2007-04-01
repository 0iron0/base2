/*
	cssQuery version 3.0 (beta) - copyright 2004-2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

var cssQuery = function(selector, context) {
	selector = new base2.DOM.Selector(selector);
	var result = selector.$evaluate(context || document);
	if (result.snapshotItem) { // xpath
		var nodes = [];
		var length = result.snapshotLength;
		for (var i = 0; i < length; i++) {
			nodes[i] = result.snapshotItem(i);
		}
		result = nodes;
	}	
	return base2.Array2(result); // add sugar methods
};

cssQuery.version = "3.0 (beta)/" + base2.DOM.version;
