
var _Behavior = Base.extend({
  attach: Undefined,
  detach: Undefined,
  modify: Undefined,

  jsbExtendedMouse: false, // allow right and middle button clicks
  jsbUseDispatch: true,    // use event dispatch (not a callback)
  jsbUseDelegation: true,  // use event delegation (appropriate events are handled by the document object)

  ancestorOf: function(behavior) {
    return behavior instanceof this.constructor;
  },

  extend: function(_interface) {
    // Extend a behavior to create a new behavior.

    if (!_interface) _interface = {};
    
    // Create the Behavior constructor.
    var Behavior = function(){};
    (Behavior.prototype = new this.constructor).constructor = Behavior;

    var interfaces = _interface["implements"] || [];
    delete _interface["implements"];
    interfaces.push(_interface);
    for (var i = 0; _interface = interfaces[i]; i++) {
      extend(Behavior.prototype, _interface);
    }

    var behavior = new Behavior;

    // Extract events.

    var delegatedEvents = [],
        events,
        eventListener = {
          handleEvent: function(event) {
            jsb.eventDispatcher.dispatch(behavior, event.target, event);
          }
        };

    for (var name in behavior) {
      if (typeof behavior[name] == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (!behavior.jsbUseDelegation || _CANNOT_DELEGATE.test(type)) {
          if (!events) events = [];
          events.push(type);
        } else if (!_EVENT_PSEUDO.test(type)) {
          delegatedEvents.push(type);
        }
      }
    }

    var attachments = {behavior: behavior};

    behavior.attach = function(element) {
      var uniqueID = element.uniqueID || assignID(element);

      if (attachments[uniqueID] === undefined) { // don't attach more than once
        // Maintain attachment state.
        attachments[uniqueID] = true;
        if (!_allAttachments[uniqueID]) _allAttachments[uniqueID] = 0;
        _allAttachments[uniqueID]++;

        // Add event handlers
        if (delegatedEvents) {
          for (var i = 0; type = delegatedEvents[i]; i++) {
            jsb.eventDelegator.addEventListener(type, attachments);
          }
          delegatedEvents = null; // we only need to attach these once per document
        }
        if (events) { // these events cannot be delegated
          for (var i = 0; type = events[i]; i++) {
            EventTarget.addEventListener(element, type, eventListener, false);
          }
        }

        // JSB events.
        if (behavior.onattach) {
          _dispatchJSBEvent(behavior, element, "attach");
        }
        if (behavior.oncontentready) {
          if (_state.isContentReady(element)) {
            _dispatchJSBEvent(behavior, element, "contentready");
          } else {
            _state.contentReadyQueue.push({behavior: behavior, element: element});
          }
        }
        if (behavior.ondocumentready) {
          if (_state.ready) {
            _dispatchJSBEvent(behavior, element, "documentready");
          } else {
            _state.documentReadyQueue.push({behavior: behavior, element: element});
          }
        }
        if (behavior.onfocus && element == document.activeElement) {
          behavior.dispatchEvent(element, "focus");
        }
      }
    };

    behavior.detach = function(element) {
      var uniqueID = element.uniqueID;
      if (attachments[uniqueID]) {
        if (arguments[1]) { // events only
          attachments[uniqueID] = false;
        } else {
          delete attachments[uniqueID];
        }
        _allAttachments[uniqueID]--;
        if (events) {
          for (var i = 0; type = events[i]; i++) {
            EventTarget.removeEventListener(element, type, eventListener, false);
          }
        }
      }
    };

    var modifications = Behavior.modifications = {},
        specificities = {};

    behavior.modify = function(attributes) {
      attributes = extend(pcopy(behavior), attributes);
      return {
        isModification: true,

        attach: function(element, rule) {
          behavior.attach(element);
          var uniqueID = element.uniqueID;
          if (rule.specificity >= (specificities[uniqueID] || 0)) { // this shouldn't be necessary as rules are sorted by specificity
            specificities[uniqueID] = rule.specificity;
            modifications[uniqueID] = attributes;
          }
        }
      };
    };

    return behavior;
  },

  // Manage properties

  get: function(element, propertyName) {
    // Retrieve a DOM property.

    // special cases
    if (propertyName == "textContent") {
      propertyName = Traversal.TEXT_CONTENT;
    }
    
    var attributes = this.constructor.modifications[element.uniqueID] || this,
        defaultValue = attributes[propertyName],
        value;

    if (propertyName != "type") {
      value = element[propertyName];
    }
    if (value === undefined) {
      value = Element.getAttribute(element, propertyName);
    }
    if (value == null) return defaultValue;
    
    switch (typeof defaultValue) {
      case "boolean": return true;
      case "number":  return value - 0;
    }
    return value;
  },

  set: function(element, propertyName, value) {
    // Set a DOM property.

    // special cases
    var isInnerHTML = propertyName == "innerHTML";
    if (isInnerHTML || propertyName == "textContent") {
      Traversal.setTextContent(element, value, isInnerHTML);
      // Don't send an event for these modifications
    } else {
      var originalValue = element[propertyName];
      if (originalValue === undefined) {
        originalValue = this.get(element, propertyName);
        if (typeof this[propertyName] == "boolean" && !value) {
          Element.removeAttribute(element, propertyName);
        } else {
          Element.setAttribute(element, propertyName, value);
        }
      } else {
        element[propertyName] = value;
      }
      if (originalValue !== this.get(element, propertyName)) {
        this.dispatchEvent(element, "propertyset", {
          propertyName: propertyName,
          originalValue: originalValue
        });
      }
    }
  },

  toggle: function(element, propertyName) {
    this.set(element, propertyName, !this.get(element, propertyName));
  },

  dispatchEvent: function(node, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, _GENERIC_EVENTS);
      var bubbles = true, cancelable = false;
      if (data) {
        if (data.bubbles != null) bubbles = !!data.bubbles;
        if (data.cancelable != null) cancelable = !!data.cancelable;
        delete data.bubbles;
        delete data.cancelable;
      }
      Event.initEvent(event, type, bubbles, cancelable);
    }
    if (data) extend(event, data);
    event.returnValue = undefined;
    event.cancelBubble = false;
    EventTarget.dispatchEvent(node, event);
  },

  // You should mostly use element.style.
  // Use this to retrieve newer properties like "opacity".

  getStyle: function(element, propertyName) {
    return CSSStyleDeclaration.getPropertyValue(element.style, propertyName);
  },

  // Setting element.style is quicker but this offers cross-browser safety and the
  // ability to set the !important flag.

  setStyle: function(element, propertyName, value, important) {
    var style = element.style;
    if (arguments.length > 2) {
      CSSStyleDeclaration.setProperty(style, propertyName, value, important ? "important" : "");
    } else {
      CSSStyleDeclaration.setProperties(style, arguments[1]);
    }
  },

  getComputedStyle: function(element, propertyName) {
    var view = document.defaultView;
    if (arguments.length == 1) {
      return ViewCSS.getComputedStyle(view, element, null);
    } else {
      return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    }
  },

  animate: function(element, transitions) {
    return new Animation(element.style, transitions, element, true);
  },

  // For positioning popups.

  getOffsetFromBody: function(element) {
    return ElementView.getOffsetFromBody(element);
  },

  // Mouse capture. Useful for drag/drop. Not perfect, but almost always good enough.

  setCapture: function(element) {
    if (element != _state.captureElement) this.releaseCapture();
    if (!_state.captureElement) {
      _state.captureElement = element;
    }
  },

  releaseCapture: function() {
    var element = _state.captureElement;
    if (element) {
      delete _state.captureElement;
      this.dispatchEvent(element, "losecapture");
      if (!this.matchesSelector(element, ":hover")) {
        this.dispatchEvent(element, "mouseout");
      }
    }
  }
});

var behavior = _Behavior.prototype;

// Bind timers to behaviors.

forEach.csv ("setInterval,setTimeout", function(name) {
  behavior[name] = function(callback, delay) {
    if (typeof callback == "string") callback = this[callback];
    var args = Array2.slice(arguments, 2);
    var self = this;
    return global[name](function() {
      callback.apply(self, args);
    }, delay || 1);
  };
});

// querySelector/querySelectorAll

forEach.csv ("querySelector,querySelectorAll", function(name) {
  behavior[name] = function(node, selector) {
    if (arguments.length == 1) {
      selector = node;
      node = document;
    }
    return NodeSelector[name](node, selector);
  };
});

// Additional DOM methods (from base2.dom).

forEach ([ // attach generic DOM methods
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

// addClass/hasClass/removeClass/toggleClass

ClassList.forEach(function(method, name) {
  if (name == "contains") name = "has";
  behavior[name + "Class"] = method;
});

behavior = new _Behavior; // seal-off
