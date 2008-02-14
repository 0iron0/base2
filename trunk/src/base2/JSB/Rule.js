
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
      if (_ready) {
        var elements = selector.exec(document);
        ;;; console2.log("final("+assignID(this)+"): "+elements.length);
        batch.forEach (elements, behavior.bind);
      } else {
        var state = domQuery.state || [];
        state.unshift(document, false);
        elements = domQuery.apply(null, state);
        if (elements.length) {
          ;;; console2.log("batch("+assignID(this)+"): "+elements.length);
          batch.forEach(elements, behavior.bind);
        }
      }
    };

    this.toString = selector.toString;
    
    _addRule(this);
  },
  
  refresh: Undefined // defined in the constructor function
});
