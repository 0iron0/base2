
// DOM Traversal. Just the basics.

// Loosely based on this:
// http://www.w3.org/TR/2007/WD-ElementTraversal-20070727/

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
    return node[Traversal.$TEXT];
  },

  isEmpty: function(node) {
    node = node.firstChild;
    while (node) {
      if (node.nodeType == 3 || this.isElement(node)) return false;
      node = node.nextSibling;
    }
    return true;
  },

  setTextContent: function(node, text) {
    return node[Traversal.$TEXT] = text;
  },
  
  "@MSIE": {
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
  $TEXT: "textContent",
  
  contains: function(node, target) {
    while (target && (target = target.parentNode) && node != target) continue;
    return !!target;
  },
  
  getDocument: function(node) {
    // return the document object
    return this.isDocument(node) ? node : this.getOwnerDocument(node);
  },
  
  isDocument: function(node) {
    return !!(node && node.documentElement);
  },
  
  isElement: function(node) {
    return !!(node && node.nodeType == 1);
  },
  
  "@(element.contains)": {  
    contains: function(node, target) {
      return node != target && this.isDocument(node) ? node == this.getOwnerDocument(target) : node.contains(target);
    }
  },
  
  "@MSIE": {
    $TEXT: "innerText"
  },
  
  "@MSIE5": {
    isElement: function(node) {
      return !!(node && node.nodeType == 1 && node.tagName != "!");
    }
  }
});
