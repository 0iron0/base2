
// DOM Traversal. Just the basics.

var TEXT = detect("(element.textContent===undefined)") ? "innerText" : "textContent";

var Traversal = Module.extend({
  getDefaultView: function(node) {
    return this.getDocument(node).defaultView;
  },

  getFirstElementChild: function(node) {
    node = node.firstChild;
    return this.isElement(node) ? node : this.getNextElementSibling(node);
  },

  getLastElementChild: function(node) {
    node = node.lastChild;
    return this.isElement(node) ? node : this.getPreviousElementSibling(node);
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

  getTextContent: function(node, isHTML) {
    return node[isHTML ? "innerHTML" : TEXT];
  },

  isEmpty: function(node) {
    node = node.firstChild;
    while (node) {
      if (node.nodeType == 3 || this.isElement(node)) return false;
      node = node.nextSibling;
    }
    return true;
  },

  setTextContent: function(node, text, isHTML) {
    return node[isHTML ? "innerHTML" : TEXT] = text;
  },

  "@!MSIE": {
    setTextContent: function(node, text, isHTML) {
      // Destroy the DOM (slightly faster for non-MISE browsers)
      with (node) while (lastChild) parentNode.removeChild(lastChild);
      return this.base(node, text, isHTML);
    }
  },

  "@MSIE": {
    getDefaultView: function(node) {
      return (node.document || node).parentWindow;
    },
  
    "@MSIE5": {
      // return the node's containing document
      getOwnerDocument: function(node) {
        return node.ownerDocument || node.document;
      }
    }
  }
}, {
  TEXT: TEXT,
  
  contains: function(node, target) {
    node.nodeType; // throw an error if no node supplied
    while (target && (target = target.parentNode) && node != target) continue;
    return !!target;
  },
  
  getDocument: function(node) {
    // return the document object
    return this.isDocument(node) ? node : node.ownerDocument || node.document;
  },
  
  isDocument: function(node) {
    return !!(node && node.documentElement);
  },
  
  isElement: function(node) {
    return !!(node && node.nodeType == 1);
  },
  
  "@(element.contains)": {  
    contains: function(node, target) {
      return node != target && (this.isDocument(node) ? node == this.getOwnerDocument(target) : node.contains(target));
    }
  },
  
  "@MSIE5": {
    isElement: function(node) {
      return !!(node && node.nodeType == 1 && node.nodeName != "!");
    }
  }
});
