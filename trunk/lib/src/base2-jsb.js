// timestamp: Wed, 19 Dec 2007 18:49:34

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/package.js
// =========================================================================

// JavaScript Behaviors

var JSB = new base2.Package(this, {
  name:    "JSB",
  version: "0.8",
  imports: "DOM",
  exports: "Behavior,Rule,RuleList"
});

eval(this.imports);

var _bind;

// =========================================================================
// JSB/Behavior.js
// =========================================================================

var Behavior = Abstract.extend();

// =========================================================================
// JSB/Call.js
// =========================================================================

var Call = Base.extend({
  constructor: function(context, method, args, rank) {
    this.release = function() {
      method.apply(context, args);
    };
    this.rank = rank || (100 + Call.list.length);
  }
}, {
  list: [],
  
  defer: function(method, rank) {
    // defers a method call until DOMContentLoaded
    return function() {
      if (Call.list) {
        Call.list.push(new Call(this, method, arguments, rank));
      } else {
        method.apply(this, arguments);
      }
    };
  },
  
  init: function() {
    EventTarget.addEventListener(document, "DOMContentLoaded", function() {
      _bind = DOM.bind[document.base2ID];
      // release deferred calls
      if (Call.list) {
        Call.list.sort(function(a, b) {
          return a.rank - b.rank;
        });
        invoke(Call.list, "release");
        delete Call.list;
        setTimeout(function() { // jump out of the current event
          var event = DocumentEvent.createEvent(document, "Events");
          Event.initEvent(event, "ready", false, false);
          EventTarget.dispatchEvent(document, event);
        }, 1);
      }
    }, false);
  }
});

// =========================================================================
// JSB/Rule.js
// =========================================================================

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    selector = new Selector(selector);
    if (!Behavior.ancestorOf(behavior)) {
      behavior = Behavior.extend(behavior);
    }
    
    // Internal data.
    var result, applied = {};
    var events = {}, _interface = {};
    
    // Extract behavior properties.
    forEach (behavior.prototype, function(property, name) {
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
      } else {
        // Store element propertie and methods.
        _interface[name] = property;
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
          // Add event listeners.
          forEach (events, function(listener, type) {
            EventTarget.addEventListener(element, type, listener, false);
          });
          // Extend the element.
          extend(element, _interface);
        }
      });
    });
    
    this.toString = K(String(selector));
    
    this.refresh();
  },
  
  refresh: Undefined // defined in the constructor function
});

// =========================================================================
// JSB/RuleList.js
// =========================================================================

// A collection of Rule objects

var RuleList = Collection.extend({
  constructor: function(rules) {
    this.base(rules);
    this.globalize(); //-dean: make this optional
  },
  
  globalize: Call.defer(function() {
    // execution of this method is deferred until the DOMContentLoaded event
    var LIST = /[^\s,]+/g;
    var ID = /^#[\w-]+$/;
    forEach (this, function(rule, selector) {
      // add all ID selectors to the global namespace
      forEach (match(selector, LIST), function(selector) {
        if (ID.test(selector)) {
          var name = ViewCSS.toCamelCase(selector.slice(1));
          window[name] = Document.querySelector(document, selector);
        }
      });
    });
  }, 10),
  
  refresh: function() {
    this.invoke("refresh");
  }
}, {
  Item: Rule
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
