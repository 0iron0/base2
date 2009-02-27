
var allAttachments = {};

var behavior = jsb.behavior = new Base({
  attach: I,
  detach: I,
  
  extendedMouse: false, // allow right and middle button clicks
  
  ancestorOf: function(behavior) {
    return behavior instanceof this.constructor;
  },

  extend: function(_interface) {
    // Extend a behavior to create a new behavior.
    var behavior = pcopy(this); // beget
    if (this == jsb.behavior) behavior.extendedMouse = false; // preserve the default for direct descendants of jsb.behavior
    extend(behavior, _interface);
    
    // Private.
    var attachments = {behavior: behavior},
        delegatedEvents = [], events, type, // uniqueIDs
        eventListener = {
          handleEvent: function(event) {
            _eventDispatcher.dispatchEvent(behavior, event.target, event);
          }
        };
        
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
      var document = element[_OWNER_DOCUMENT],
          documentID = document.base2ID || assignID(document),
          uniqueID = documentID + (element.uniqueID || assignID(element, "uniqueID"));
      if (!attachments[uniqueID]) { // don't attach more than once
        attachments[uniqueID] = true;
        if (!allAttachments[uniqueID]) allAttachments[uniqueID] = 0;
        allAttachments[uniqueID]++;
        // Add event handlers
        if (!delegatedEvents[documentID]) {
          delegatedEvents[documentID] = true; // we only need to attach these once
          for (var i = 0; type = delegatedEvents[i]; i++) {
            _eventDelegator.addEventListener(document, type, attachments);
          }
        }
        if (events) {
          for (var i = 0; type = events[i]; i++) {
            EventTarget.addEventListener(element, type, eventListener, false);
          }
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
      var uniqueID = element[_OWNER_DOCUMENT].base2ID + element.uniqueID;
      if (attachments[uniqueID]) {
        delete attachments[uniqueID];
        if (allAttachments[uniqueID]) allAttachments[uniqueID]--;
        if (events) {
          for (var i = 0; type = events[i]; i++) {
            EventTarget.removeEventListener(element, type, eventListener, false);
          }
        }
      }
    };

    return behavior;
  },

  get: function(element, propertyName) {
    // Retrieve a DOM property.
    // The rules:
    //  1. Look for the actual DOM property
    //  2. If not found, look for an attribute
    //  3. If not found, use the property defined on the behavior (default)
    //  4. Cast the retrieved value to the same type as the default value
    
    var value = element[propertyName];
    if (value == null) {
      var defaultValue = value = this[propertyName];
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
    get: function(element, propertyName) {
      var defaultValue = this[propertyName],
          value = element[propertyName];
      if (value == null) {
        value = defaultValue;
      } else if (defaultValue != null) {
        value = defaultValue.constructor(value); // cast
      }
      return value;
    }
  },

  set: function(element, propertyName, value, triggerEvent) {
    // Set a DOM property.
    // This basically delegates to element.settAttribute().
    
    // If triggerEvent is true then a change event is fired identifying the property.
    //  e.g. behavior.set(element, "example", 99); // => fires onexamplechange
    // Change events bubble but are not cancelable.
    
    var oldValue = this.get(element, propertyName);
    if (oldValue !== value) {
      this.setAttribute(element, propertyName, value);
      if (triggerEvent) this.dispatchEvent(element, propertyName.toLowerCase() + "change");
    }
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
    // This is not defined as a standard but it's damned useful.
    return ElementView.getOffsetFromBody(element);
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
