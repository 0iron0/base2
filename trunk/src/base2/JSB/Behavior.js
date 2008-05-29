
var Behavior = global.Behavior = new Base({
  attach: I,
  detach: I,

  modify: function(_interface) {
    // Extend a behavior to create a new behavior.
    var behavior = copy(this).extend(_interface);
    behavior.EventDelegator = this.EventDelegator || EventDelegator;
    if (_interface && _interface.EventDelegator) {
      behavior.EventDelegator = behavior.EventDelegator.extend(_interface.EventDelegator);
    }
    var events, delegatedEvents = [];
    var attachedElementIDs = {}; // base2IDs
    var eventListener = new EventListener(new behavior.EventDelegator(behavior, attachedElementIDs));

    // Extract events.
    forEach (behavior, function(property, name) {
      if (typeof property == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (_CAN_DELEGATE.test(type)) {
          delegatedEvents.push(type);
        } else {
          if (!events) events = [];
          events.push(type);
        }
      }
    });

    behavior.attach = function(element) {
      //if (!element) return;
      var base2ID = element.base2ID || assignID(element);
      if (!attachedElementIDs[base2ID]) { // Don't attach more than once.
        attachedElementIDs[base2ID] = true;
        if (JSB.globalize && element.id) global[JSB.globalize + ViewCSS.toCamelCase(element.id)] = element;
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
            DocumentState.readyQueue.push({element: element, behavior: behavior});
          }
        }
        if (element == document.activeElement && behavior.onfocus) {
          behavior.dispatchEvent(element, "focus");
        }
      }
      return element;
    };

    behavior.detach = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (attachedElementIDs[base2ID]) {
        if (behavior.ondetach) behavior.ondetach(element);
        delete attachedElementIDs[base2ID];
      }
      return element;
    };
    
    if (behavior.init) behavior.init();

    return behavior;
  },

  EventDelegator: null,

  dispatchEvent: function(element, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, "Events");
      Event.initEvent(event, type, true, false);
    }
    EventTarget.dispatchEvent(element, extend(event, data));
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
        if (_OPERA) getSelection().collapse(document.body, 0); // prevent text selection
        if (event.type == "mousemove" || event.eventPhase == 3) {
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
          element.fireEvent("onmouseup");
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
