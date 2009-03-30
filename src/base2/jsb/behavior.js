
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
      var uniqueID = element.uniqueID || assignID(element, "uniqueID");
          
      if (!attachments[uniqueID]) { // don't attach more than once
        // Maintain attachment state.
        attachments[uniqueID] = true;
        if (!_allAttachments[uniqueID]) _allAttachments[uniqueID] = 0;
        _allAttachments[uniqueID]++;
        
        // Add event handlers
        if (delegatedEvents) {
          for (var i = 0; type = delegatedEvents[i]; i++) {
            _eventDelegator.addEventListener(type, attachments);
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
          var uniqueID = element.uniqueID;
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
  
  animate: function(element, transitions) {
    // An ugly method. I may move it to Transitions.js. ;-)
    
    var defaultTransition;
    forEach (transitions, function(transition, propertyName) {
      var recurse = arguments.callee; // recurse after we've broken down shorthand properties
      if (typeof transition == "string") {
        transition = {end: transition};
      }
      // The first transition in the list defines the default
      // values for duration and  delay for subsequent transitions.
      if (!defaultTransition) defaultTransition = transition;
      transition = copy(transition);
      if (transition.delay == null && defaultTransition.delay != null) {
        transition.delay = defaultTransition.delay;
      }
      if (transition.duration == null && defaultTransition.duration != null) {
        transition.duration = defaultTransition.duration;
      }
      // Break shorthand properties into the longhand version.
      // This only parses property names. Values are parsed in Transition.js.
      // Some shorthand properties cannot be parsed. (I should fix backgroundPosition eventually)
      if (/^(font|background(Position)?)$/.test(propertyName)) {
        throw "Cannot animate complex property '" + propertyName + "'.";
      } else if (/^border(Top|Right|Bottom|Left)?$/.test(propertyName)) { // shorthand border properties
        var property = propertyName,
            start = _split(transition.start),
            end = _split(transition.end),
            names = ["Width", "Style", "Color"];
        forEach (end, function(end, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end;
          recurse(params, property + names[i]);
        });
      } else if (/^(margin|padding|border(Width|Color|Style))$/.test(propertyName)) { // shorthand rect properties (T,R,B,L)
        var property = propertyName.replace(/Width|Color|Style/, ""),
            name = propertyName.replace(property, "");
        start = _split(transition.start, true);
        end = _split(transition.end, true);
        forEach.csv ("Top,Right,Bottom,Left", function(side, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end[i];
          _state.transitions.add(element, property + side + name, params);
        });
      } else {
        _state.transitions.add(element, propertyName, transition);
      }
    });
  },
  
  // Manage properties

  get: function(element, propertyName) {
    // Retrieve a DOM property.
    var attributes = this.constructor.modifications[element.uniqueID] || this,
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
      event = DocumentEvent.createEvent(document, "Events");
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
    EventTarget.dispatchEvent(node, event);
  },
  
  getComputedStyle: function(element, propertyName) {
    var view = document.defaultView;
    if (arguments.length == 1) {
      return ViewCSS.getComputedStyle(view, element, null);
    } else {
      return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    }
  },
  
  // Setting element.style is quicker but this offers cross-browser safety and the
  // ability to set the !important flag.

  setStyle: function(element, propertyName, value, important) {
    var style = element.style;
    if (arguments.length == 2) {
      var properties = extend({}, arguments[1]);
      for (propertyName in properties) {
        CSSStyleDeclaration.setProperty(style, propertyName, properties[propertyName], "");
      }
    } else {
      CSSStyleDeclaration.setProperty(style, propertyName, value, important ? "important" : "");
    }
  },
  
  // For positioning popups.

  getOffsetFromBody: function(element) {
    return ElementView.getOffsetFromBody(element);
  },
  
  // Mouse capture. Useful for drag/drop. Not perfect, but almost always good enough.

  captureMouse: function(element) {
    if (!_state.captureElement) _state.captureElement = element;
  },

  releaseMouse: function() {
    delete _state.captureElement;
  }
});

var behavior = _Behavior.prototype;

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

// Additional methods (from base2.DOM)

forEach.csv ("querySelector,querySelectorAll", function(name) {
  behavior[name] = function(node, selector) {
    if (arguments.length == 1) {
      selector = node;
      node = document;
    }
    return NodeSelector[name](node, selector);
  };
});

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

ClassList.forEach(function(method, name) {
  behavior[name + "Class"] = bind(method, ClassList);
});

behavior = new _Behavior; // seal-off
