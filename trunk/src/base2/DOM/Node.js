
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({
  // http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
  "@!(element.compareDocumentPosition)" : {
    compareDocumentPosition: function(node, other) {
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
      return 1; // disconnected
    }
  }
});
