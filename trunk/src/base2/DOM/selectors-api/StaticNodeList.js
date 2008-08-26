
// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.
// The item() method provides access to elements.
// Implements Enumerable so you can forEach() to your heart's content... :-)

var StaticNodeList = Base.extend({
  constructor: function(nodes) {
    nodes = nodes || [];
    this.length = nodes.length;
    this.item = function(index) {
      if (index < 0) index += this.length; // starting from the end
      return nodes[index];
    };
    if (nodes.unsorted) nodes.sort(_SORTER);
  },
  
  length: 0,
  
  forEach: function(block, context) {
    for (var i = 0; i < this.length; i++) {
      block.call(context, this.item(i), i, this);
    }
  },

  item: Undefined, // defined in the constructor function

  not: function(test, context) {
    return this.filter(not(test), context);
  },

  slice: function(start, end) {
    return new StaticNodeList(this.map(I).slice(start, end));
  },

  "@(XPathResult)": {
    constructor: function(nodes) {
      if (nodes && nodes.snapshotItem) {
        this.length = nodes.snapshotLength;
        this.item = function(index) {
          if (index < 0) index += this.length; // starting from the end
          return nodes.snapshotItem(index);
        };
      } else this.base(nodes);
    }
  }
});

StaticNodeList.implement(Enumerable);

var _matchesSelector = function(test, context) {
  if (typeof test != "function") {
    test = bind("test", new Selector(test));
  }
  return this.base(test, context);
};

StaticNodeList.implement({
  every: _matchesSelector,
  filter: _matchesSelector,
  not: _matchesSelector,
  some: _matchesSelector
});

StaticNodeList.implement({
  filter: function(test, context) {
    return new StaticNodeList(this.base(test, context));
  }
});

var _SORTER = _INDEXED ? function(node1, node2) {
  return node1.sourceIndex - node2.sourceIndex;
} : function(node1, node2) {
  return (Node.compareDocumentPosition(node1, node2) & 2) - 1;
};
