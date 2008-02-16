
var Behavior = Module.extend(null, {
  attach: I,
  detach: I,
  
  extend: function(_interface, _static) {
    // Extend a behavior to create a new behavior.
    var behavior = this.base(_interface, _static);
    var attachedElementIDs = {}; // base2IDs
    var events = {}, attributes = {}, methods;
    var eventListener = new EventListener(behavior, attachedElementIDs);
    
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

    behavior.attach = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (!attachedElementIDs[base2ID]) { // Don't attach more than once.
        attachedElementIDs[base2ID] = true;
        // If the document is bound then bind the element.
        var docID = document.base2ID;
        if (DOM.bind[docID]) DOM.bind(element);
        // Add event handlers
        if (events) {
          forEach (events, bind(flip(eventListener.add), eventListener));
          events = null; // We are using event delegation. ;-)
        }
        // Extend the element.
        for (var name in attributes) {
          var attribute = attributes[name];
          if (element[name] === undefined && typeof attribute != "object") {
            element.setAttribute(name, attribute)
          } else {
            element[name] = attribute;
          }
        }
        if (methods) extend(element, methods);
        if (behavior.onattach) behavior.onattach(element);
      }
      return element;
    };

    behavior.detach = function(element) {
      var base2ID = element.base2ID || assignID(element);
      if (attachedElementIDs[base2ID]) { // Don't attach more than once.
        if (behavior.ondetach) behavior.ondetach(element);
        delete attachedElementIDs[base2ID];
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

  handleKeyEvent: function(element, event, type) {
    type = event.type;
    var handler = "on" + type;
    if (this[handler]) {
      if (type == "keypress") {
        this[handler](element, event, event.charCode);
      } else {
        this[handler](element, event, event.keyCode, event.shiftKey, event.ctrlKey, event.altKey);
      }
    }
  },

  handleMouseEvent: function(element, event, type) {
    type = event.type;
    var handler = "on" + type;
    if (this[handler] && (!_EVENT_BUTTON.test(type) || event.button == _MOUSE_BUTTON_LEFT)) {
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
