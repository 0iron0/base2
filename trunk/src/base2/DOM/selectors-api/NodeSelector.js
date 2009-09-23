
// http://www.w3.org/TR/selectors-api/#nodeselector

var NodeSelector = Interface.extend({
  "@(element.querySelector)": {
    querySelector: function(node, selector) {
      if (!_USE_BASE2.test(selector)) {
        try {
          return this.base(node, selector);
        } catch (x) {
          // assume it's an unsupported selector
        }
      }
      return new Selector(selector).exec(node, 1);
    },
    
    querySelectorAll: function(node, selector) {
      if (!_USE_BASE2.test(selector)) {
        try {
          return StaticNodeList.bind(this.base(node, selector));
        } catch (x) {
          // assume it's an unsupported selector
        }
      }
      return new Selector(selector).exec(node);
    }
  },

  "@!(element.querySelector)": {
    querySelector: function(node, selector) {
      return new Selector(selector).exec(node, 1);
    },

    querySelectorAll: function(node, selector) {
      return new Selector(selector).exec(node);
    }
  }
});

if (_element.querySelectorAll) { // http://code.google.com/p/base2/issues/detail?id=100
  _element.innerHTML = '<a id="X"></a>';
  if (_element.querySelectorAll("#X").length == 0) {
    NodeSelector.implement({
      querySelectorAll: function(node, selector) {
        if (/[A-Z]/.test(selector)) {
          if (!/^CSS/.test(Traversal.getDocument(node).compatMode)) {
            return new Selector(selector).exec(node);
          }
        }
        return this.base(node, selector);
      }
    });
  }
}

// automatically bind objects retrieved using the Selectors API on a bound node
extend(NodeSelector.prototype, {
  querySelector: function(selector) {
    return dom.bind(this.base(selector));
  },

  querySelectorAll: function(selector) {
    var match = this.base(selector);
    var i = match.length;
    while (i--) dom.bind(match[i]);
    return match;
  }
});
