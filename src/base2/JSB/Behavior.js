
var behavior = jsb.behavior = new Base({
  attach: I,
  detach: I,
  
  extendedMouse: false,
  
  ancestorOf: function(behavior) {
    return behavior instanceof this.constructor;
  },

  implement: function(_interface) {
    return extend(this, _interface);
  },

  extend: function(_interface) {
    // Extend a behavior to create a new behavior.
    var behavior = pcopy(this); // beget
    if (this == jsb.behavior) behavior.extendedMouse = false; // preserve the default for direct descendants of jsb.behavior
    behavior.implement(_interface);
    
    // Private.
    var events,
        delegatedEvents = [],
        attachments = {}, // uniqueIDs
        eventDispatcher = new EventDispatcher(behavior, attachments);

    // Extract events.
    forEach (behavior, function(property, name) {
      if (typeof property == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (_CANNOT_DELEGATE.test(type)) {
          if (!events) events = [];
          events.push(type);
        } else if (!_EVENT_PSEUDO.test(type)) {
          delegatedEvents.push(type);
        }
      }
    });

    behavior.attach = function(element) {
      var uniqueID = element.uniqueID || assignID(element, "uniqueID");
      if (!attachments[uniqueID]) { // don't attach more than once
        attachments[uniqueID] = true;
        var document = element[_OWNER_DOCUMENT],
            documentID = document.base2ID || assignID(document);
        // Add event handlers
        if (!delegatedEvents[documentID]) {
          delegatedEvents[documentID] = true; // we only need to attach these once
          forEach (delegatedEvents, bind("delegate", eventDispatcher, document));
        }
        if (events) {
          forEach (events, bind("add", eventDispatcher, element));
        }
        // Pseudo events.
        if (behavior.onattach) behavior.onattach(element);
        if (behavior.oncontentready) {
          if (state.isContentReady(element)) {
            behavior.oncontentready(element);
          } else {
            state.contentReadyQueue.push({behavior: behavior, element: element});
          }
        }
        if (behavior.ondocumentready && !state.ready) {
          state.documentReadyQueue.push({behavior: behavior, element: element});
        }
        if (behavior.onfocus && element == document.activeElement) {
          behavior.dispatchEvent(element, "focus");
        }
      }
    };

    behavior.detach = function(element) {
      delete attachments[element.uniqueID];
    };

    return behavior;
  },

  dispatchEvent: function(node, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(Traversal.getDocument(node), "Events");
      Event.initEvent(event, type, true, false);
    }
    if (data) extend(event, data);
    EventTarget.dispatchEvent(node, event);
  },

  getComputedStyle: function(element, propertyName) {
    var view = element[_OWNER_DOCUMENT].defaultView;
    if (propertyName) return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    return ViewCSS.getComputedStyle(view, element, null);
  },

  getCSSProperty: function(element, propertyName) {
    return ViewCSS.getComputedPropertyValue(element[_OWNER_DOCUMENT].defaultView, element, propertyName);
  },

  setCSSProperty: function(element, propertyName, value, important) {
    CSSStyleDeclaration.setProperty(element.style, propertyName, value, important ? "important" : "");
  },
  
  getOffsetFromBody: function(element) {
    return ElementView.getOffsetFromBody(element);
  },

  getProperty: function(element, propertyName) {
    var value = element[propertyName];
    if (value == null) {
      value = this[propertyName];
      if (element.hasAttribute(propertyName)) {
        value = element.getAttribute(propertyName);
        if (defaultValue != null) {
          value = defaultValue.constructor(value); // cast
        }
      }
    }
    return value;
  },

  "@(element.getAttribute('expando'))": {
    getProperty: function(element, propertyName) {
      var value = element[propertyName];
      if (value == null) {
        value = this[propertyName];
      } else if (defaultValue != null) {
        value = defaultValue.constructor(value); // cast
      }
      return value;
    }
  },

  setProperty: function(element, propertyName, value, triggerEvent) {
    var oldValue = this.getProperty(element, propertyName);
    if (oldValue !== value) {
      this.setAttribute(element, propertyName, value);
      if (triggerEvent) this.dispatchEvent(element, propertyName.toLowerCase() + "change");
    }
  },

  captureMouse: function(element) {
    if (!state._captureElement) state._captureElement = element;
  },

  releaseMouse: function() {
    delete state._captureElement;
  }
});

forEach.csv("setInterval,setTimeout", function(name) {
  behavior[name] = function(callback, delay) {
    if (typeof callback == "string") callback = this[callback];
    var args = Array2.slice(arguments, 2);
    var self = this;
    return global[name](function() {
      callback.apply(self, args);
    }, delay || 1);
  };
});

// Additional methods (from base2.DOM)

forEach.csv("querySelector,querySelectorAll", function(name) {
  behavior[name] = function(node, selector) {
    if (arguments.length == 1) {
      selector = node;
      node = document;
    }
    return NodeSelector[name](node, selector);
  };
});

forEach ([
  EventTarget,
  ElementView,
  Node,
  Element
], function(_interface) {
  _interface.forEach(function(method, name) {
    if (!behavior[name]) {
      behavior[name] = bind(method, _interface);
    }
  });
});

ClassList.forEach(function(method, name) {
  behavior[name + "Class"] = bind(method, ClassList);
});
