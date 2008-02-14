
var Behavior = Module.extend(null, {
  bind: I,
  
  extend: function(_interface, _static) {
    // Extend a behavior to create a new behavior.
    var behavior = this.base(_interface, _static);
    var boundElementIDs = {};
    var events = {}, attributes = {}, methods;
    
    var eventListener = new Base({
      handleEvent: function(event) {
        var type = event.type;
        var fixedType = _EVENT_TYPE_FIX[type];
        if (_EVENT_MOUSE.test(fixedType || type) && MouseCapture._handleEvent) {
          event.stopPropagation();
          event.preventDefault();
        } else {
          var element = event.target;
          if (element && boundElementIDs[element.base2ID]) {
            if (fixedType) event = _EventFixer.fix(event, fixedType);
            behavior.handleEvent(element, event, event.type);
          }
        }
      },
      
      "@Gecko" : {
        handleEvent: function(event) {
          if (_EVENT_MOUSE.test(event.type)) {
            var box = document.getBoxObjectFor(event.target);
            event.offsetX = event.pageX - box.x;
            event.offsetY = event.pageY - box.y;
          }
          this.base(event);
        }
      }
    });
    
    // Extract behavior properties.
    behavior.forEach (function(property, name) {
      if (_EVENT.test(name)) {
        // Store event handlers.
        var type = name.slice(2);
        events[_EVENT_TYPE_MAP[type] || type] = property;
      } else {
        // Store methods.
        if (!methods) methods = {};
        methods[name] = behavior.prototype[name];
      }
    });
    forEach.detect (_interface, function(property, name) {
      // Store attributes.
      if (typeOf(property) != "function") {
        attributes[name] = property;
      }
    });

    behavior.bind = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (!boundElementIDs[base2ID]) { // Don't bind more than once.
        boundElementIDs[base2ID] = true;
        // If the document is bound then bind the element.
        var docID = document.base2ID;
        if (DOM.bind[docID]) DOM.bind(element);
        // Add event handlers
        if (events) {
          for (var type in events) {
            addEventListener(document, type, eventListener, _CAPTURE.test(type));
            if (type == "mousemove") {
              addEventListener(document, type, eventListener, true);
            }
          }
          events = null; // We are using event delegation. ;-)
        }
        // Extend the element.
        for (var name in attributes) {
          if (element[name] === undefined) {
            element.setAttribute(name, attributes[name])
          } else {
            element[name] = attributes[name];
          }
        }
        if (methods) extend(element, methods);
        if (behavior.oncontentready) behavior.oncontentready(element);
      }
      return element;
    };

    return behavior;
  },

  dispatchEvent: function(element, event) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, "Events");
      Event.initEvent(event, type, true, false);
      //forEach.detect (data, function(property, name) {
      //  event[name] = property;
      //});
    }
    EventTarget.dispatchEvent(element, event);
  },

  handleEvent: function(element, event, type) {
    // We could use the passed event type but we can't trust the descendant
    // classes to always pass it. :-P
    type = event.type;
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

  handleMouseEvent: function(element, event, type) {
    type = event.type;
    var handler = "on" + type;
    if (this[handler] && (!_BUTTON.test(type) || event.button == _MOUSE_BUTTON_LEFT)) {
      if (type == "mousewheel") {
        this[handler](element, event, event.wheelDelta);
      } else {
        this[handler](element, event, event.offsetX, event.offsetY, event.screenX, event.screenY);
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
