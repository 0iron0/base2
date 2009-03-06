
// http://www.w3.org/TR/selectors-api/

var _VISITED = /:visited/; // security

var NodeSelector = Interface.extend({
  "@(element.querySelector)": {
    querySelector: function(node, selector) {
      if (!_VISITED.test(selector)) {
        try {
          return this.base(node, trim(selector));
        } catch (x) {
          // assume it's an unsupported selector
          ;;; console2.log("UNSUPPORTED SELECTOR: " + selector);
        }
      }
      return new Selector(selector).exec(node, 1);
    },
    
    querySelectorAll: function(node, selector) {
      if (!_VISITED.test(selector)) {
        try {
          return new StaticNodeList(this.base(node, trim(selector)));
        } catch (x) {
          // assume it's an unsupported selector
          ;;; console2.log("UNSUPPORTED SELECTOR: " + selector);
        }
      }
      return new Selector(selector).exec(node);
    },

    "@KHTML": { // http://code.google.com/p/base2/issues/detail?id=100
      querySelectorAll: function(node, selector) {
        if (!/[A-Z]/.test(selector) || "BackCompat" != (node ? node.ownerDocument || node : document).compatMode) {
          return this.base(node, selector);
        }
        return new Selector(selector).exec(node);
      }
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
