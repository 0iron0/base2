
extend(DOM, "bind", function(node) {
	if (typeof node.className == "string") {
		// it's an HTML element, use bindings based on tag name
		(HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
	} else if (node.body !== undefined) {
		HTMLDocument.bind(node);
	} else {
		this.base(node);
	}
	return node;
});
