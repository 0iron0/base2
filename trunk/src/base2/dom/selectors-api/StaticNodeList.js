
// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.

var StaticNodeList = Base.extend({
  constructor: function(nodes) {
    nodes = nodes || [];
    if (nodes.unsorted) nodes.sort(_SORTER);
    var length = nodes.length, i = 0, j = 0;
    if (length) this[0] = undefined; // fixes a weird bug in Opera
    while (i < length) {
      // For comma separated selectors (e.g. "span,abbr") on platforms
      // that support sourceIndex, then elements are stored by sourceIndex
      // to avoid sorting.
      if (nodes[i]) this[j++] = nodes[i];
      i++;
    }
    this.length = j;
  },
  
  length: 0,

  forEach: function(block, context) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
      block.call(context, this[i], i, this);
    }
  },
  
  item: Array2.prototype.item,

  not: function(test, context) {
    return this.filter(not(test), context);
  },

  slice: function(start, end) {
    return new StaticNodeList(this.map(I).slice(start, end));
  },

  "@(XPathResult)": {
    constructor: function(nodes) {
      if (nodes && nodes.snapshotItem) {
        var length = this.length = nodes.snapshotLength, i = 0;
        while (i < length) this[i] = nodes.snapshotItem(i++);
      } else this.base(nodes);
    }
  }
}, {
  bind: function(staticNodeList) {
    Base.forEach (this.prototype, function(method, name) {
      if (staticNodeList[name] === undefined) {
        staticNodeList[name] = method;
      }
    });
    return staticNodeList;
  }
});

StaticNodeList.implement(Enumerable);

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
