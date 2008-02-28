
// A Selector associated with a Behavior.

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    if (!instanceOf(selector, Selector)) {
      selector = new Selector(selector);
    }
    if (!Behavior.ancestorOf(behavior)) {
      behavior = Behavior.extend(behavior);
    }
    
    this.refresh = function() {
      selector.exec(document).forEach(behavior.attach);
    };

    this.toString = selector.toString;
    
    DocumentState.addRule(selector, behavior);
  },
  
  refresh: Undefined // defined in the constructor function
});
