
var Behavior = new Base({
  attach: Function2.I,
  detach: Function2.I,

  modify: function(_interface) {
    // Extend a behavior to create a new behavior.
    var behavior = pcopy(this).extend(_interface);
    behavior.EventDelegator = this.EventDelegator || EventDelegator;
    if (_interface && _interface.EventDelegator) {
      behavior.EventDelegator = behavior.EventDelegator.extend(_interface.EventDelegator);
    }
    var events, delegatedEvents = [];
    var attachedElementIDs = {}; // base2IDs
    var eventListener = new EventListener(new behavior.EventDelegator(behavior, attachedElementIDs));
    
    if (behavior.ondocumentready) {
      behavior._documentReadyQueue = [];
    }

    // Extract events.
    forEach (behavior, function(property, name) {
      if (typeof property == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (_CANNOT_DELEGATE.test(type)) {
          if (!events) events = [];
          events.push(type);
        } else {
          delegatedEvents.push(type);
        }
      }
    });

    behavior.attach = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (!attachedElementIDs[base2ID]) { // Don't attach more than once.
        attachedElementIDs[base2ID] = true;
        // Add event handlers
        if (delegatedEvents) {
          forEach (delegatedEvents, eventListener.delegate, eventListener);
          delegatedEvents = null;
        }
        if (events) {
          forEach (events, bind(eventListener.add, eventListener, element));
        }
        // Pseudo events.
        if (behavior.onattach) behavior.onattach(element);
        if (behavior.oncontentready) {
          if (DocumentState.isContentReady(element)) {
            behavior.oncontentready(element);
          } else {
            DocumentState.contentReadyQueue.push({element: element, behavior: behavior});
          }
        }
        if (behavior._documentReadyQueue) {
          behavior._documentReadyQueue.push(element);
        }
        if (element == document.activeElement && behavior.onfocus) {
          behavior.dispatchEvent(element, "focus");
        }
      }
      return element;
    };

    behavior.detach = function(element) {
      delete attachedElementIDs[element.base2ID];
      return element;
    };

    return behavior;
  },

  EventDelegator: null,

  dispatchEvent: function(element, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, "Events");
      Event.initEvent(event, type, true, false);
    }
    if (data) extend(event, data);
    EventTarget.dispatchEvent(element, event);
  },

  handleEvent: function(element, event, type) {
    // We could use the passed event type but we can't trust the descendant
    // classes to always pass it. :-)
    type = event.type;
    var handler = "on" + type;
    if (this[handler]) {
      if (_EVENT_MOUSE.test(type)) {
        if (!_EVENT_BUTTON.test(type) || _MOUSE_BUTTON_LEFT.test(event.button)) {
          if (type == "mousewheel") {
            this[handler](element, event, event.wheelDelta);
          } else {
            this[handler](element, event, event.offsetX, event.offsetY, event.screenX, event.screenY);
          }
        }
      } else if (_EVENT_TEXT.test(type)) {
        this[handler](element, event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
      } else {
        this[handler](element, event);
      }
    }
  },

  getProperty: function(element, name) {
    var defaultValue = this[name];
    var value = Element.getAttribute(element, name);
    if (value == null) {
      value = defaultValue;
    } else {
      value = defaultValue.constructor(value); // cast
    }
    return value;
  },

  getComputedStyle: function(element, propertyName) {
    var view = document.defaultView;
    if (propertyName) return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    return ViewCSS.getComputedStyle(view, element, null);
  },

  getCSSProperty: function(element, propertyName) {
    CSSStyleDeclaration.getPropertyValue(element.style, propertyName);
  },

  setCSSProperty: function(element, propertyName, value, important) {
    CSSStyleDeclaration.setProperty(element.style, propertyName, value, important ? "important" : "");
  },

  setCapture: function(element) {
    if (!Behavior._captureMouse) {
      var behavior = this;
      Behavior._captureElement = element;
      Behavior._captureMouse = function(event) {
        if (_OPERA9) getSelection().collapse(document.body, 0); // prevent text selection
        if (event.type == "mousemove" || event.eventPhase == Event.BUBBLING_PHASE) {
          behavior.handleEvent(element, event, event.type);
        }
      };
      this.addEventListener(document, "mouseup", Behavior._captureMouse, true);
      this.addEventListener(document, "mousemove", Behavior._captureMouse, true);
    }
  },

  releaseCapture: function() {
    if (Behavior._captureMouse) {
      this.removeEventListener(document, "mouseup", Behavior._captureMouse, true);
      this.removeEventListener(document, "mousemove", Behavior._captureMouse, true);
      delete Behavior._captureMouse;
      delete Behavior._captureElement;
    }
  },

  "@MSIE": {
    setCapture: function(element) {
      element.setCapture();
      behavior = this;
      element.attachEvent("onlosecapture", function() {
        if (Behavior._captureMouse) {
          // element.fireEvent("onmouseup");
          behavior.dispatchEvent(element, "mouseup");
        }
        element.detachEvent("onlosecapture", arguments.callee);
      });
      this.base(element);
    },

    releaseCapture: function() {
      this.base();
      document.releaseCapture();
    }
  }
});

// Additional methods (all the good ones)

forEach.csv("setInterval,setTimeout", function(name) {
  Behavior[name] = function(callback, delay) {
    if (typeof callback == "string") callback = this[callback];
    var args = Array2.slice(arguments, 2);
    var self = this;
    return global[name](function() {
      callback.apply(self, args);
    }, delay || 0);
  };
});

forEach ([
  EventTarget,
  NodeSelector,
  Node,
  Element
], function(_interface) {
  _interface.forEach(function(method, name) {
    if (!Behavior[name]) {
      Behavior[name] = bind(method, _interface);
    }
  });
});

ClassList.forEach(function(method, name) {
  Behavior[name + "Class"] = bind(method, ClassList);
});
