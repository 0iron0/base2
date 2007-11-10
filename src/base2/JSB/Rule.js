
var Rule = Base.extend({
  constructor: function(selector, binding) {
    // create the selector object
    selector = new Selector(selector);
    // create the binding
    if (typeof binding != "function") {
      binding = Binding.extend(binding);
    }
    // create the bind function
    var bound = {}; // don't bind more than once
    function bind(element) {
      var uid = assignID(element);
      if (!bound[uid]) {
        bound[uid] = true;
        binding(DOM.bind(element));
      }
    };
    // execution of this method is deferred until the DOMContentLoaded event
    this.apply = Call.defer(function() {
      try {
        var elements = selector.exec(document);
      } catch (error) {
        if (!instanceOf(error, SyntaxError)) throw error;
        throw new SyntaxError(format("Selector '%1' is not supported by JSB", selector));
      }
      forEach (elements, bind);
    });
    this.toString = K(String(selector));
    this.apply();
  },
  
  apply: Undefined,
  
  refresh: function() {
    this.apply();
  }
});
