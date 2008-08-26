
// http://www.w3.org/TR/selectors-api/

var NodeSelector = Interface.extend({
  "@(element.querySelector)": {
    querySelector: function(node, selector) {
      try {
        var element = this.base(node, trim(selector));
        if (element) return element;
      } catch(x) {}
      // assume it's an unsupported selector
      return new Selector(selector).exec(node, 1);
    },
    
    querySelectorAll: function(node, selector) {
      try {
        var nodeList = this.base(node, trim(selector));
        if (nodeList) return new StaticNodeList(nodeList);
      } catch(x) {}
      // assume it's an unsupported selector
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

// automatically bind objects retrieved using the Selectors API on a bound node

extend(NodeSelector.prototype, {
  querySelector: function(selector) {
    return DOM.bind(this.base(selector));
  },

  querySelectorAll: function(selector) {
    return extend(this.base(selector), "item", function(index) {
      return DOM.bind(this.base(index));
    });
  }
});
