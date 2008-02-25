
// A Selector associated with a Behavior.

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    if (!instanceOf(selector, Selector)) {
      selector = new Selector(selector);
    }
    if (!Behavior.ancestorOf(behavior)) {
      behavior = Behavior.extend(behavior);
    }
    
    var domQuery = Selector.parse(selector);
    
    this.refresh = function() {
      selector.exec(document).forEach(behavior.attach);
    };

    this.toString = selector.toString;
    
    _addRule(selector, behavior);
  },
  
  refresh: Undefined // defined in the constructor function
});
