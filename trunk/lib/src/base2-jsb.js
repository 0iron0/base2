// timestamp: Wed, 05 Dec 2007 04:03:40

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/namespace.js
// =========================================================================

var JSB = new base2.Namespace(this, {
  name:    "JSB",
  version: "0.7",
  imports: "DOM",
  exports: "Behavior, Rule, RuleList"
});

eval(this.imports);

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
      // release deferred calls
      if (Call.list) {
        DOM.bind(document);
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
