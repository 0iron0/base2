
var Behavior = Module.extend(null, {
  bind: I,
  
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var behavior = this.base(_interface, _static);
    var attributes = {}, methods, events = {};
    var boundElements = {};
    var eventListener = {
      handleEvent: function(event) {
        var type = event.type;
        var fixedType = _EVENT_TYPE_FIX[type];
        if (_EVENT_MOUSE.test(fixedType || type) && MouseCapture._capture) {
          event.stopPropagation();
          event.preventDefault();
        } else if (type == "ready" && typeof behavior.ondocumentready == "function") {
          forEach (boundElements, behavior.ondocumentready, behavior);
        } else {
          var target = event.target;
          if (target) {
            if (boundElements[target.base2ID]) {
              if (fixedType) {
                event = _EventFixer.fix(event, fixedType);
              }
              behavior.handleEvent(target, event);
            }
          }
        }
      }
    };

    // Extract behavior properties.
    behavior.forEach (function(property, name) {
      if (_EVENT.test(name)) {
        var type = name.slice(2);
        events[_EVENT_TYPE_MAP[type] || type] = property;
      } else {
        // Store methods.
        if (!methods) methods = {};
        methods[name] = behavior.prototype[name];
      }
    });
    forEach (_interface, function(property, name) {
      if (name.charAt(0) == "@") { // object detection
        if (detect(name.slice(1))) {
          forEach (property, arguments.callee);
        }
      } else if (typeOf(property) != "function") {
        attributes[name] = property;
      }
    });

    behavior.bind = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (!boundElements[base2ID]) { // Don't bind more than once.
        boundElements[base2ID] = element;
        // If the document is bound then bind the element.
        if (DOM.bind[document.base2ID]) DOM.bind(element);
        // Add event handlers (we are using event delegation so only do this once)
        if (events) {
          for (var type in events) {
            EventTarget.addEventListener(document, type, eventListener, _CAPTURE.test(type));
          }
          events = null;
        }
        // Extend the element.
        for (var name in attributes) {
          if (element[name] == undefined) {
            element.setAttribute(name, attributes[name]);
          } else {
            element[name] = attributes[name];
          }
        }
        if (methods) extend(element, methods);
        if (typeof behavior.oncontentready == "function") {
          behavior.oncontentready(element);
        }
      }
      return element;
    };

    return behavior;
  },

  dispatchEvent: function(element, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, "Events");
      Event.initEvent(event, type, true, false);
      forEach (data, function(property, name) {
        event[name] = property;
      });
    }
    EventTarget.dispatchEvent(element, event);
  },

  handleEvent: function(element, event) {
    var type = event.type;
    if (_EVENT_MOUSE.test(type)) {
      this.handleMouseEvent(element, event, type);
    } else if (_EVENT_KEYBOARD.test(type)) {
      this.handleKeyEvent(element, event, type);
    } else {
      if (this["on" + type]) {
        this["on" + type](element, event);
      }
    }
  },

  handleKeyEvent: function(element, event) {
    var handler = "on" + event.type;
    if (this[handler]) {
      this[handler](element, event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey);
    }
  },

  handleMouseEvent: function(element, event) {
    var handler = "on" + event.type;
    if (this[handler] && (!_BUTTON.test(event.type) || event.button == _MOUSE_BUTTON_LEFT)) {
      this[handler](element, event, event.offsetX, event.offsetY, event.screenX, event.screenY);
    }
  },
  
  "@Gecko": {
    handleMouseEvent: function(element, event) {
      event.offsetX = event.layerX;
      event.offsetY = event.layerY;
      this.base(element, event);
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

  setCSSProperty: function(element, propertyName, value, priority) {
    CSSStyleDeclaration.setProperty(element.style, propertyName, value, priority ? "important" : "");
  }
});

forEach ([EventTarget, NodeSelector, Node, Element], function(module) {
  module.forEach(function(method, name) {
    if (!Behavior[name]) {
      Behavior[name] = bind(method, module);
    }
  });
});

ClassList.forEach(function(method, name) {
  Behavior[name + "Class"] = bind(method, ClassList);
});