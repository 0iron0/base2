
// DOM Traversal. Just the basics.
var Traversal = Module.extend({
  contains: function(node, target) {
    node.nodeType; // throw an error if no node supplied
    while (target && (target = target[_PARENT]) && node != target) continue;
    return !!target;
  },

  getFirstElementChild: function(element) {
    element = element.firstChild;
    return this.isElement(element) ? element : this.getNextElementSibling(element);
  },

  getLastElementChild: function(element) {
    element = element.lastChild;
    return this.isElement(element) ? element : this.getPreviousElementSibling(element);
  },

  getNextElementSibling: function(element) {
    // return the next element to the supplied element
    while (element && (element = element.nextSibling) && !this.isElement(element)) continue;
    return element;
  },

  getNodeIndex: function(node) {
    var index = 0;
    while (node && (node = node.previousSibling)) index++;
    return index;
  },
  
  getOwnerDocument: function(element) {
    // return the node's containing document
    return element.ownerDocument;
  },
  
  getPreviousElementSibling: function(element) {
    // return the previous element to the supplied element
    while (element && (element = element.previousSibling) && !this.isElement(element)) continue;
    return element;
  },

  getTextContent: function(node, isHTML) {
    return node[node.nodeType == 1 ? isHTML ? "innerHTML" : _TEXT_CONTENT : "nodeValue"];
  },

  includes: function(node, target) {
    return !!target && (node == target || this.contains(node, target));
  },

  isEmpty: function(element) {
    element = element.firstChild;
    while (element) {
      if (element.nodeType == 3 || this.isElement(element)) return false;
      element = element.nextSibling;
    }
    return true;
  },

  setTextContent: function(node, text, isHTML) {
    node[node.nodeType == 1 ? isHTML ? "innerHTML" : _TEXT_CONTENT : "nodeValue"] = text;
  },

  "@!MSIE": {
    setTextContent: function(node, text, isHTML) {
      // Destroy the DOM (slightly faster for non-MISE browsers)
      with (node) while (lastChild) removeChild(lastChild);
      this.base(node, text, isHTML);
    }
  },

  "@(jscript<5.6)": {
    getOwnerDocument: function(element) {
      return element.document.parentWindow.document;
    }
  }
}, {
  TEXT_CONTENT: _TEXT_CONTENT,

  getDefaultView: function(nodeOrWindow) {
    // return the document object
    return (nodeOrWindow.ownerDocument || nodeOrWindow.document || nodeOrWindow).defaultView;
  },

  getDocument: function(nodeOrWindow) {
    // return the document object
    return this.isDocument(nodeOrWindow) ?
      nodeOrWindow : nodeOrWindow.nodeType ? this.getOwnerDocument(nodeOrWindow) : nodeOrWindow.document || null;
  },
  
  isDocument: function(node) {
    return !!node && node.nodeType == 9;
  },

  isElement: function(node) {
    return !!node && node.nodeType == 1;
  },

  isXML: function(node) {
    return !this.getDocument(node).getElementById;
  },

  "@!(document.defaultView)": {
    getDefaultView: function(nodeOrWindow) {
      // return the document object
      return (nodeOrWindow.document || nodeOrWindow).parentWindow;
    }
  },

  "@(jscript<5.6)": {
    isDocument: function(node) {
      return !!(node && (node.nodeType == 9 || node.writeln));
    },
    
    isElement: function(node) {
      return !!node && node.nodeType == 1 && node.nodeName != "!";
    }
  }
});
