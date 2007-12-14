
var Rule = Base.extend({
  constructor: function(selector, behavior) {
    selector = new Selector(selector);
    if (!Behavior.ancestorOf(behavior)) {
      behavior = Behavior.extend(behavior);
    }
    behavior = behavior.prototype;
    
    // Internal data.
    var result, applied = {}, extensions = {}, events = {}, style = behavior.style;
    
    // Extract behavior properties.
    forEach (behavior, function(property, name) {
      // Platform specific extensions.
      if (name.charAt(0) == "@") {
        if (detect(name.slice(1))) {
          forEach (property, arguments.callee);
        }
      } else if (typeof property == "function" && /^on[a-z]+$/.test(name)) {
        // Allow elements to pick up document events (e.g. ondocumentclick).
        if (name.indexOf("document") == 2) {
          EventTarget.addEventListener(document, name.slice(10), function(event) {
            result.invoke(property, event);
          }, false);
        } else {
          // Store event handlers.
          events[name.slice(2)] = property;
        }
      } else if (name != "style") {
        // Store element extensions.
        extensions[name] = property;
      }
    });
    
    // Execution of this method is deferred until the DOMContentLoaded event.
    this.refresh = Call.defer(function() {
      // Find matching elements.
      result = selector.exec();
      // Apply the behavior.
      result.forEach(function(element) {
        var uid = assignID(element);
        if (!applied[uid]) { // Don't apply more than once.
          applied[uid] = true;
          // If the document is bound then bind the element.
          if (_bind) DOM.bind(element);
          // Extend the element.
          extend(element, extensions);
          extend(element.style, style);
          // Add event listeners.
          forEach (events, function(listener, type) {
            EventTarget.addEventListener(element, type, listener, false);
          });
        }
      });
    });
    
    this.toString = K(String(selector));
    
    this.refresh();
  },
  
  refresh: Undefined // defined in the constructor function
});
