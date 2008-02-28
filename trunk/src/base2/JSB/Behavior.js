
var Behavior = Module.extend(null, {
  attach: I,
  detach: I,

  extend: function(_interface, _static) {
    // Extend a behavior to create a new behavior.
    var behavior = this.base(_interface, _static);
    behavior.EventDelegator = this.EventDelegator || EventDelegator;
    if (_static && _static.EventDelegator) {
      behavior.EventDelegator = behavior.EventDelegator.extend(_static.EventDelegator);
    }
    var events = {}, attributes = {}, methods;
    var attachedElementIDs = {}; // base2IDs
    var eventListener = new EventListener(new behavior.EventDelegator(behavior, attachedElementIDs));

    // Extract behavior properties.
    behavior.forEach (function(property, name) {
      if (_EVENT.test(name)) {
        // Store event handlers.
        events[name.slice(2)] = property;
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

    var docID = document.base2ID;
    behavior.attach = function(element) {
      //if (!element) return;
      var base2ID = element.base2ID || assignID(element);
      if (!attachedElementIDs[base2ID]) { // Don't attach more than once.
        attachedElementIDs[base2ID] = true;
        //if (element.id) global["$" + ViewCSS.toCamelCase(element.id)] = element;
        // If the document is bound then bind the element.
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
        //;;;console2.log("beforeattach: "+behavior.onattach);
        if (behavior.onattach) behavior.onattach(element);
        if (behavior.oncontentready) {
          if (DocumentState.isContentReady(element)) {
            behavior.oncontentready(element);
          } else {
            DocumentState.readyQueue.push({element: element, behavior: behavior});
          }
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
    // classes to always pass it. :-)
    type = event.type;
    if (element == document) console2.log(type);
    //;;; if(!/mouse(move|over|out)/.test(type)) console2.log(type+" :" +event.button);
    var handler = "on" + type;
    if (handler) {
      if (_EVENT_MOUSE.test(type)) {
        if (!_EVENT_BUTTON.test(type) || _MOUSE_BUTTON_LEFT.test(event.button)) {
          if (type == "mousewheel") {
            this[handler](element, event, event.wheelDelta);
          } else {
            this[handler](element, event, event.offsetX, event.offsetY, event.screenX, event.screenY);
          }
        }
      } else if (_EVENT_KEYBOARD.test(type)) {
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
