
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({  
  "@!(element.compareDocumentPosition)" : {
    compareDocumentPosition: function(node, other) {
      // http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
      
      if (Traversal.contains(node, other)) {
        return 4|16; // following|contained_by
      } else if (Traversal.contains(other, node)) {
        return 2|8;  // preceding|contains
      }
      
      var nodeIndex = _getSourceIndex(node);
      var otherIndex = _getSourceIndex(other);
      
      if (nodeIndex < otherIndex) {
        return 4; // following
      } else if (nodeIndex > otherIndex) {
        return 2; // preceding
      }      
      return 0;
    }
  }
}, {
  "@Gecko": {
    bind: function(node) {
      return extend(this.base(node), "removeEventListener", function() {
        var args = Array2.slice(arguments);
        args.unshift(this);
        EventTarget.removeEventListener.apply(EventTarget, args);
      });
    }
  }
});

var _getSourceIndex = document.documentElement.sourceIndex ? function(node) {
  return node.sourceIndex;
} : function(node) {
  // return a key suitable for comparing nodes
  var key = 0;
  while (node) {
    key = Traversal.getNodeIndex(node) + "." + key;
    node = node.parentNode;
  }
  return key;
};
