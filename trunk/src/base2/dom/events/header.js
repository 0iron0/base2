
// TO DO: textInput event

var _CAPTURING_PHASE = 1,
    _AT_TARGET       = 2,
    _BUBBLING_PHASE  = 3;


var _BUTTON_MAP      = {"2": 2, "4": 1},
    _EVENT_MAP       = {focusin: "focus", focusout: "blur"},
    _MOUSE_BUTTON    = /^mouse(up|down)|click$/,
    _MOUSE_CLICK     = /click$/,
    _NO_BUBBLE       = /^((before|un)?load|focus|blur|stop|(readystate|property|filter)change|losecapture)$/,
    _CANCELABLE      = /^((dbl)?click|mouse(down|up|over|out|wheel)|key(down|up|press)|submit|DOMActivate|(before)?(cut|copy|paste)|contextmenu|drag(start|enter|over)?|drop|before(de)?activate)$/,
    _CANNOT_DELEGATE = /^(abort|error|load|scroll|(readystate|property|filter)change)$/;
    //_CAN_DELEGATE = /^(submit|reset|select|change|blur)$|^(mouse|key|focus)|click$/;

var _wrappedListeners = {},
    _wrappedTypes = extend({}, {
  DOMContentLoaded: "base2ContentLoaded",
  mouseenter: "mouseover",
  mouseleave: "mouseout",
  "@Gecko": {
    mousewheel: "DOMMouseScroll"
  }
});

function _wrap(type, listener, wrapper) {
  var key = type + "#" + assignID(listener);
  if (!_wrappedListeners[key]) {
    _wrappedListeners[key] = wrapper;
  }
  return _wrappedListeners[key];
};

function _unwrap(type, listener) {
  return _wrappedListeners[type + "#" + listener.base2ID] || listener;
};

function _handleEvent(target, listener, event) {
  if (typeof listener == "function") {
    listener.call(target, event);
  } else {
    listener.handleEvent(event);
  }
};

// break out of clsoures to attach events in MSIE
extend(_private, {
  suppress: {},
  listeners: {},
  handlers: {},

  attachEvent: function(target, type, listener) {
    var listenerID = base2.assignID(listener);
    var handleEvent = this.handlers[listenerID];
    if (!handleEvent) {
      this.listeners[listenerID] = listener;
      handleEvent = this.handlers[listenerID] = new Function("e", "base2.toString.listeners['" + listenerID + "'](e)");
    }
    target.attachEvent(type, handleEvent);
  },

  detachEvent: function(target, type, listener, permanent) {
    var listenerID = listener.base2ID;
    target.detachEvent(type, this.handlers[listenerID]);
    if (permanent) {
      delete this.listeners[listenerID];
      delete this.handlers[listenerID];
    }
  }
});
