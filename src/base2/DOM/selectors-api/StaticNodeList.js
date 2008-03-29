
// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.
// The item() method provides access to elements.
// Implements Enumerable so you can forEach() to your heart's content... :-)

var StaticNodeList = Base.extend({
  constructor: function(nodes) {
    nodes = nodes || [];
    this.length = nodes.length;
    this.item = function(index) {
      return nodes[index];
    };
/*  // Sorting large node lists can be slow so only do it if necessary.
    // You must still explicitly call sort() to get a sorted node list.
    if (nodes.unsorted) this.sort = function() {
      nodes.sort(_SORTER);
      return this;
    }; */
  },
  
  length: 0,
  
  forEach: function(block, context) {
    for (var i = 0; i < this.length; i++) {
      block.call(context, this.item(i), i, this);
    }
  },

  item: Undefined, // defined in the constructor function
//sort: This,

  "@(XPathResult)": {
    constructor: function(nodes) {
      if (nodes && nodes.snapshotItem) {
        this.length = nodes.snapshotLength;
        this.item = function(index) {
          return nodes.snapshotItem(index);
        };
      } else this.base(nodes);
    }
  }
});

StaticNodeList.implement(Enumerable);

/*
var _SORTER = _INDEXED ? function(node1, node2) {
  return node2.sourceIndex - node2.sourceIndex;
} : function(node1, node2) {
  return (Node.compareDocumentPosition(node1, node2) & 2) - 1;
};
*/
