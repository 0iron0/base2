
// TO DO

// textInput event

var _CAPTURE_TYPE = {},
    _TYPE_MAP     = {"2": 2, "4": 1};

var _CAPTURING_PHASE = 1,
    _AT_TARGET       = 2,
    _BUBBLING_PHASE  = 3;
    
var _MOUSE_BUTTON   = /^mouse(up|down)|click$/,
    _MOUSE_CLICK    = /click$/,
    _BUBBLES        = "abort|error|select|change|resize|scroll|", // + _CANCELABLE
    _CANCELABLE     = "(dbl)?click|mouse(down|up|over|move|out|wheel)|key(down|up)|submit|reset";

    _BUBBLES = new RegExp("^(" + _BUBBLES + _CANCELABLE + ")$");
    _CANCELABLE = new RegExp("^(" + _CANCELABLE + ")$");

if (_MSIE) {
  var _W3C_EVENT_TYPE = {focusin: "focus", focusout: "blur"};
      _CAPTURE_TYPE   = {focus: "focusin", blur: "focusout"};
}

var _CAN_DELEGATE = /^(blur|submit|reset|change|select)$|^(mouse|key|focus)|click$/;
