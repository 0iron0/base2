
var ElementSelector = NodeSelector.extend({
  "@!(element.matchesSelector)": { // future-proof
    matchesSelector: function(element, selector) {
      return new Selector(selector).test(element);
    }
  }
});
