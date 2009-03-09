
var _Behavior = Base.extend({
  attach: I,
  detach: I,
  modify: Null,
  
  extendedMouse: false, // allow right and middle button clicks
  
  ancestorOf: function(behavior) {
    return behavior instanceof this.constructor;
  },

  extend: function(_interface) {
    // Extend a behavior to create a new behavior.
    var Behavior = function(){};
    Behavior.prototype = new this.constructor;
    Behavior.prototype.constructor = Behavior;
    var interfaces = _interface["implements"] || [];
    delete _interface["implements"];
    interfaces.push(_interface);
    for (var i = 0; _interface = interfaces[i]; i++) {
      extend(Behavior.prototype, _interface);
    }
    var behavior = new Behavior;
    
    // Private.
    var attachments = {behavior: behavior}, // uniqueIDs
        modifications = {}, specificities = {},
        delegatedEvents = [], events = null, type,
        eventListener = {
          handleEvent: function(event) {
            _dispatchEvent(behavior, event.target, event);
          }
        };
    Behavior.modifications = modifications;
        
    // Extract events.
    for (var name in behavior) {
      if (typeof behavior[name] == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (_CANNOT_DELEGATE.test(type)) {
          if (!events) events = [];
          events.push(type);
        } else if (!_EVENT_PSEUDO.test(type)) {
          delegatedEvents.push(type);
        }
      }
    }

    behavior.attach = function(element) {
      var document = element[_OWNER_DOCUMENT],
          documentID = document.base2ID || assignID(document),
          uniqueID = documentID + (element.uniqueID || assignID(element, "uniqueID"));
          
      if (!attachments[uniqueID]) { // don't attach more than once
        // Maintain attachment state.
        attachments[uniqueID] = true;
        if (!_allAttachments[uniqueID]) _allAttachments[uniqueID] = 0;
        _allAttachments[uniqueID]++;
        
        // Add event handlers
        if (!delegatedEvents[documentID]) {
          delegatedEvents[documentID] = true; // we only need to attach these once per document
          for (var i = 0; type = delegatedEvents[i]; i++) {
            _eventDelegator.addEventListener(document, type, attachments);
          }
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
      var uniqueID = element[_OWNER_DOCUMENT].base2ID + element.uniqueID;
      if (attachments[uniqueID]) {
        delete attachments[uniqueID];
        _allAttachments[uniqueID]--;
        if (events) {
          for (var i = 0; type = events[i]; i++) {
            EventTarget.removeEventListener(element, type, eventListener, false);
          }
        }
      }
    };

    behavior.modify = function(attributes) {
      attributes = extend(pcopy(behavior), attributes);
      return {
        isModification: true,

        attach: function(element, rule) {
          behavior.attach(element);
          var uniqueID = element[_OWNER_DOCUMENT].base2ID + element.uniqueID;
          if (rule.specificity >= (specificities[uniqueID] || 0)) { // this shouldn't be necessary as rules are sorted by specificity
            specificities[uniqueID] = rule.specificity;
            modifications[uniqueID] = attributes;
          }
          return element;
        }
      };
    };

    return behavior;
  },

  get: function(element, propertyName) {
    // Retrieve a DOM property.
    var uniqueID = element[_OWNER_DOCUMENT].base2ID + element.uniqueID,
        attributes = this.constructor.modifications[uniqueID] || this,
        defaultValue = attributes[propertyName],
        value = Element.getAttribute(element, propertyName);
    if (value == null) return defaultValue;
    switch (typeof defaultValue) {
      case "boolean": return true;
      case "number":  return value - 0;
    }
    return value;
  },

  set: function(element, propertyName, value) {
    var originalValue = this.get(element, propertyName);
    Element.setAttribute(element, propertyName, value);
    if (originalValue !== value) {
      this.dispatchEvent(element, propertyName + "change", {originalValue: originalValue});
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
    if (arguments.length == 1) {
      return ViewCSS.getComputedStyle(view, element, null);
    } else {
      return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    }
  },

  setStyle: function(element, propertyName, value, important) {
    var style = element.style;
    if (arguments.length == 2) {
      var properties = arguments[1];
      for (propertyName in properties) {
        CSSStyleDeclaration.setProperty(style, propertyName, properties[propertyName], "");
      }
    } else {
      CSSStyleDeclaration.setProperty(style, propertyName, value, important ? "important" : "");
    }
  },

  getOffsetFromBody: function(element) {
    return ElementView.getOffsetFromBody(element);
  },

  captureMouse: function(element) {
    if (!_state.captureElement) _state.captureElement = element;
  },

  releaseMouse: function() {
    delete _state.captureElement;
  }
});

var behavior = _Behavior.prototype;

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

behavior = new _Behavior;
