
var _MSIE  = detect("MSIE"),
    _OPERA = detect("opera");

var _ID         = /^\*#([\w-]+)$/,
    _COMBINATOR = /[\s+~>]/,
    _SIMPLE     = /(^|([\s+~>,])|[#.\[])([\w-]+)/g;

var _EVENT          = /^on[a-z]+$/,
    _EVENT_BUTTON   = /^mouse(up|down)|click$/,
    _EVENT_CAPTURE  = /^(focus|blur)$/,
    _EVENT_CLICK    = /click$/,
    _EVENT_KEYBOARD = /^key/,
    _EVENT_MOUSE    = /^(DOM)?mouse|click$/i;

var _EVENT_TYPE_MAP = extend({}, {
/*  "@MSIE": {
    focus: "focusin",
    blur:  "focusout"
  }, */

  "@Gecko": {
    mousewheel: "DOMMouseScroll"
  }
});

var _EVENT_TYPE_FIX = reduce(_EVENT_TYPE_MAP, function(fixed, type, fixedType) {
  fixed[type] = fixedType;
  return fixed;
}, {});


//var _MOUSE_EVENTS = String2.csv("over,out,move,down,up,wheel");

var _MOUSE_BUTTON_LEFT = 0;

var _ready;

var _rulesAll         = [],
    _rulesByAttribute = {},
    _rulesByID        = {},
    _rulesByTagName   = {};

var _parser = new CSSParser;
