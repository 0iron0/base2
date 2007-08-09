// timestamp: Thu, 09 Aug 2007 07:35:10

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/namespace.js
// =========================================================================

var JSB = new base2.Namespace(this, {
  name:    "JSB",
  version: "0.7",
  imports: "DOM",
  exports: "Binding, Rule, RuleList"
});

eval(this.imports);

// =========================================================================
// JSB/Binding.js
// =========================================================================

// Remember: a binding is a function

var Binding = Abstract.extend();

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
          EventTarget.dispatchEvent(document,'ready');
        }, 0);
      }
    }, false);
  }
});

// =========================================================================
// JSB/Rule.js
// =========================================================================

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
    this.toString = returns(String(selector));
    this.apply();
  },
  
  apply: Undefined,
  
  refresh: function() {
    this.apply();
  }
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
          window[name] = Document.matchSingle(document, selector);
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

// =========================================================================
// JSB/Event.js
// =========================================================================

extend(Event, {
  PATTERN: /^on(DOMContentLoaded|[a-z]+)$/,
  
  cancel: function(event) {
    event.stopPropagation();
    event.preventDefault();
    return false;
  }
});

// =========================================================================
// JSB/EventTarget.js
// =========================================================================

extend(EventTarget, {
  addEventListener: function(target, type, listener, capture) {
    // Allow elements to pick up document events (e.g. ondocumentclick).
    if (type.indexOf("document") == 0) {
      type = type.slice(8);
      listener = bind(listener, target);
      target = Traversal.getDocument(target);
    }
    // call the default method
    this.base(target, type, listener, capture);
  },
  
/*  dispatchEvent: function(target, event) { 
    // Allow the event to be a string identifying its type.
    if (typeof event == "string") {
      var type = event;
      var document = Traversal.getDocument(target);
      event = document.createEvent("Events");
      event.initEvent(type, false, false);
    }
    this.base(target, event);
  }, */

  removeEventListener: function(target, type, listener, capture) {
    if (type.indexOf("document") == 0) {
      type = type.slice(8);
      target = Traversal.getDocument(target);
    }
    this.base(target, type, listener, capture);
  }
});

// =========================================================================
// JSB/HTMLElement.js
// =========================================================================

extend(HTMLElement.prototype, "extend", function(name, value) {
  if (!base2.__prototyping && arguments.length >= 2) {
    // automatically attach event handlers when extending
    if (Event.PATTERN.test(name) && typeof value == "function") {
      EventTarget.addEventListener(this, name.slice(2), value, false);
      return this;
    }
    // extend the style object
    if (name == "style") {
      extend(this.style, value);
      return this;
    }
    if (name == "extend") return this;
  }
  return base(this, arguments);
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
