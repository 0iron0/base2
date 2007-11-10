
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
      
      var nodeIndex = Node.$getSourceIndex(node);
      var otherIndex = Node.$getSourceIndex(other);
      
      if (nodeIndex < otherIndex) {
        return 4; // following
      } else if (nodeIndex > otherIndex) {
        return 2; // preceding
      }      
      return 0;
    }
  }
}, {
  $getSourceIndex: function(node) {
    // return a key suitable for comparing nodes
    var key = 0;
    while (node) {
      key = Traversal.getNodeIndex(node) + "." + key;
      node = node.parentNode;
    }
    return key;
  },
  
  "@(element.sourceIndex)": {  
    $getSourceIndex: function(node) {
      return node.sourceIndex;
    }
  }
});
