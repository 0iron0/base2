
var _MOUSE_BUTTON_LEFT = _MSIE ? 1 : 0;

var _BUTTON         = /^mouse(up|down)|click$/,
    _CAPTURE        = /^(focus|blur|keypress)$/,
    _EVENT          = /^on[a-z]+$/,
    _EVENT_KEYBOARD = /^key/,
    _EVENT_MOUSE    = /^(DOM)?mouse|click$/i;

var _EVENT_TYPE_MAP = extend({}, {
  "@MSIE": {
    blur: "focusout",
    focus: "focusin"
  },
  "@Gecko": {
    mousewheel: "DOMMouseScroll"
  }
});

var _EVENT_TYPE_FIX = reduce(_EVENT_TYPE_MAP, function(fixed, type, fixedType) {
  fixed[type] = fixedType;
  return fixed;
}, {});

var _EventFixer = new Base({
  fix: function(event, type) {
    var fixedEvent = copy(event);
    fixedEvent.type = type;
    fixedEvent.stopPropagation = function() {
      event.stopPropagation();
    };
    fixedEvent.preventDefault = function() {
      event.preventDefault();
    };
    return fixedEvent;
  },

  "@Gecko": {
    fix: function(event, type) {
      event.__defineGetter__("type", K(type));
      event.wheelDelta = -event.detail * 40;
      return event;
    }
  }
});
