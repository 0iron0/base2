
// A Selector associated with a behavior.

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    if (!instanceOf(selector, Selector)) {
      selector = new Selector(selector);
    }
    if (typeof behavior == "string") {
      behavior = new External(behavior, function(external) {
        behavior = external;
      });
    } else if (!jsb.behavior.ancestorOf(behavior)) {
      behavior = jsb.behavior.extend(behavior);
    }
    
    this.refresh = function() {
      if (behavior.attach) selector.exec(document).forEach(behavior.attach);
    };

    this.toString = selector.toString;
    
    state.addRule(selector, behavior);
  },
  
  refresh: Undefined // defined in the constructor function
});
