
var _EVENT              = /^on([a-z|DOM\w+]+)$/,
    _EVENT_BUTTON       = /^mouse(up|down)|click$/,
    _EVENT_CLICK        = /click$/,
    _EVENT_MOUSE        = /^mouse|click$/,
    _EVENT_OVER_OUT     = /^mouse(over|out)$/,
    _EVENT_PSEUDO       = /^(attach|detach|(content|document)ready)$/,
    _EVENT_TEXT         = /^(key|text)/,
    _EVENT_USE_CAPTURE  = /^(focus|blur)$/;

var _CANNOT_DELEGATE    = /^(abort|error|load|scroll|(readystate|property|filter)change)$/,
    _HTML_BODY          = /^(HTML|BODY)$/,
    _MOUSE_BUTTON_LEFT  = /^[^12]$/;
    
var _DIGITS             = /\d+/g;

var _allAttachments       = {};

var _parseInt16 = partial(parseInt, undefined, 16);

function _createDummyElement(tagName) {
  var dummy = document.createElement(tagName || "span");
  dummy.style.cssText = "position:absolute;left:0;top:-9999px;";
  document.body.appendChild(dummy);
  return dummy;
};

function _split(value, fill) { // uased for splitting multiple CSS values
  if (value == null) return [];
  value = trim(value).split(/\s+/);
  if (fill) {
    if (value.length == 1) value[1] = value[0];
    if (value.length == 2) value[2] = value[0];
    if (value.length == 3) value[3] = value[1];
  }
  return value;
};