
var DOM = new base2.Namespace(this, {
	name:    "DOM",
	version: "0.9 (alpha)",
	exports: "Node,Document,Element,AbstractView,Event,EventTarget,DocumentEvent,DocumentSelector,ElementSelector,StaticNodeList,ViewCSS,HTMLDocument,HTMLElement,Selector,Traversal,XPathParser",
	
	bind: function(node) {
		// apply a base2 DOM Binding to a native DOM node
		if (node && node.nodeType) {
			var uid = assignID(node);
			if (!arguments.callee[uid]) {
				switch (node.nodeType) {
					case 1: // Element
						if (typeof node.className == "string") {
							// it's an HTML element, use bindings based on tag name
							(HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
						} else {
							Element.bind(node);
						}
						break;
					case 9: // Document
						if (node.links) {
							HTMLDocument.bind(node);
						} else {
							Document.bind(node);
						}
						break;
					default:
						Node.bind(node);
				}
				arguments.callee[uid] = true;
			}
		}
		return node;
	}
});

eval(this.imports);
