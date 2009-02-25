
// NOT USED

// Based on this:
// http://www.w3.org/TR/2007/WD-ElementTraversal-20070727/

var ElementTraversal = Interface.extend({
  getChildElementCount: function(node) {
    var count = 0;
    node = node.firstChild;
    while (node) {
      if (this.isElement(node)) count++;
      node = node.nextSibling;
    }
    return count;
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
    while (node && (node = node.nextSibling) && !this.isElement(node)) continue;
    return node;
  },

  getPreviousElementSibling: function(node) {
    while (node && (node = node.previousSibling) && !this.isElement(node)) continue;
    return node;
  }
}, {
  isElement: function(node) {
    return !!(node && node.nodeType == 1);
  },

  "@MSIE": {
    isElement: function(node) {
      return !!(node && node.nodeType == 1 && node.nodeName != "!");
    }
  }
});
