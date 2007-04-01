
// DOM Traversal. Just the basics.

var Traversal = Module.extend({
	getDefaultView: function(node) {
		return this.getDocument(node).defaultView;
	},
	
	getNextElementSibling: function(node) {
		// return the next element to the supplied element
		//  nextSibling is not good enough as it might return a text or comment node
		while (node && (node = node.nextSibling) && !this.isElement(node)) continue;
		return node;
	},

	getNodeIndex: function(node) {
		var index = 0;
		while (node && (node = node.previousSibling)) index++;
		return index;
	},
	
	getOwnerDocument: function(node) {
		// return the node's containing document
		return node.ownerDocument;
	},
	
	getPreviousElementSibling: function(node) {
		// return the previous element to the supplied element
		while (node && (node = node.previousSibling) && !this.isElement(node)) continue;
		return node;
	},

	getTextContent: function(node) {
		return node.textContent;
	},

	isEmpty: function(node) {
		node = node.firstChild;
		while (node) {
			if (node.nodeType == 3 || this.isElement(node)) return false;
			node = node.nextSibling;
		}
		return true;
	},
	
	"@MSIE": {
		getTextContent: function(node) {
			return node.innerText;
		},
		
		getDefaultView: function(node) {
			return this.getDocument(node).parentWindow;
		},
	
		"@MSIE5": {
			// return the node's containing document
			getOwnerDocument: function(node) {
				return node.ownerDocument || node.document;
			}
		}
	}
}, {
	contains: function(node, target) {
		return this.isDocument(node) ? node == this.getOwnerDocument(target) : node != target && node.contains(target);
	},
	
	getDocument: function(node) {
		// return the document object
		return this.isDocument(node) ? node : this.getOwnerDocument(node);
	},
	
	isDocument: function(node) {
		return Boolean(node && node.documentElement);
	},
	
	isElement: function(node) {
		return Boolean(node && node.attributes);
	},
	
	"@!(element.contains)": {
		contains: function(node, target) {
			while (target && (target = target.parentNode) && node != target) continue;
			return !!target;
		}
	},
	
	"@MSIE5": {
		isElement: function(node) {
			return this.base(node) && node.tagName != "!";
		}
	}
});
