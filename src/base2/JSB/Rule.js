
var _EVENT = /^on[a-z]+$/;

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    // Create the selector object.
    selector = new Selector(selector);
    
    if (Behavior.ancestorOf(behavior)) {
      behavior = behavior.prototype;
    }
    
    var extensions = {}, events = {}, style = behavior.style, applied = {};
    
    forEach (behavior, function(property, name) {
      if (name.charAt(0) == "@") { // Add platform specific extensions.
        if (detect(name.slice(1))) {
          forEach (property, arguments.callee);
        }
      } else if (typeof property == "function" && _EVENT.test(name)) {
        events[name.slice(2)] = property;
      } else if (name != "style") {
        extensions[name] = property;
      }
    });
    
    function addBehavior(element) {
      var uid = assignID(element);
      if (!applied[uid]) { // Don't apply more than once.
        applied[uid] = true;
        DOM.bind(element);
        extend(element, extensions);
        extend(element.style, style);
        for (var type in events) {
          var target = element;
          var listener = events[type];
          // Allow elements to pick up document events (e.g. ondocumentclick).
          if (type.indexOf("document") == 0) {
            target = document;
            type = type.slice(8);
            listener = bind(listener, element);
          }
          target.addEventListener(type, listener, false);
        }
      }
    };
    
    // execution of this method is deferred until the DOMContentLoaded event
    this.refresh = Call.defer(function() {
      selector.exec(document).forEach(addBehavior);
    });
    this.toString = K(String(selector));
    
    this.refresh();
  },
  
  refresh: Undefined
});
