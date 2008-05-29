
// A Selector associated with a Behavior.

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    if (!instanceOf(selector, Selector)) {
      selector = new Selector(selector);
    }
    if (typeof behavior == "string") {
      behavior = new External(behavior, function(external) {
        behavior = external;
      });
    } else if (!behavior || Behavior.constructor != behavior.constructor) {
      behavior = Behavior.modify(behavior);
    }
    
    this.refresh = function() {
      if (behavior.attach) selector.exec(document).forEach(behavior.attach);
    };

    this.toString = selector.toString;
    
    DocumentState.addRule(selector, behavior);
  },
  
  refresh: Undefined // defined in the constructor function
});
