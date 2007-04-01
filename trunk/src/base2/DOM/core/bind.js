
extend(DOM, {
	bind: function(node) {
		// apply a base2 DOM Binding to a native DOM node
		switch (node.nodeType) {
			case 1: return Element.bind(node);
			case 9: return Document.bind(node);
			default: return Node.bind(node);
		}
		return node;
	}
});

var _bound = {}; // nodes that have already been extended (keep this private)
var _bind = function(node) {
	if (node) {
		var uid = assignID(node);
		if (!_bound[uid]) {
			DOM.bind(node);
			_bound[uid] = true;
		}
	}
	return node;
};
