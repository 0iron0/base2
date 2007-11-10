
// http://www.w3.org/TR/selectors-api/

var NodeSelector = Interface.extend({
  "@!(element.querySelector)": { // future-proof
    querySelector: function(node, selector) {
      return new Selector(selector).exec(node, 1);
    },
    
    querySelectorAll: function(node, selector) {
      return new Selector(selector).exec(node);
    }
  }
});

// automatically bind objects retrieved using the Selectors API

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
