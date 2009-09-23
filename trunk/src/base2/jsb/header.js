
/*@cc_on @*/

var _EVENT              = /^on([a-z]{3,}|DOM[A-Z]\w+)$/,
    _EVENT_BUTTON       = /^mouse(up|down)|click$/,
    _EVENT_CLICK        = /click$/,
    _EVENT_MOUSE        = /^mouse|click$/,
    _EVENT_OVER_OUT     = /^mouse(enter|leave|over|out)$/,
    _EVENT_PSEUDO       = /^(attach|detach|(content|document)ready)$/,
    _EVENT_TEXT         = /^(key|text)/,
    _EVENT_USE_CAPTURE  = /^(focus|blur)$/;

var _CANNOT_DELEGATE    = /^(abort|error|load|scroll|DOMAttrModified|mouse(enter|leave)|(readystate|property|filter)change)$/,
    _HTML_BODY          = /^(HTML|BODY)$/,
    _MOUSE_BUTTON_LEFT  = /^[^12]$/;

var _DIGITS             = /\d+/g,
    _RGB_VALUE          = /\d+%?/g;

var _GENERIC_EVENTS     = detect("(document.createEvent('Events'))") ? "Events" : "UIEvents";

var _allAttachments     = {};

var _parseInt16 = partial(parseInt, undefined, 16);

function _by_specificity(selector1, selector2) {
  return selector2.specificity - selector1.specificity;
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

var _style = document.createElement("span").style;

function _getCurrentHost() {
  var host = location.pathname,
      script = Array2.item(document.getElementsByTagName("script"), -1);
      
  if (script) host = script.src || host;
  ;;; host = host.replace(/build\.php\?package=([\w\/]+)package\.xml.*$/, "$1");
  return host.replace(/[\?#].*$/, "").replace(/[^\/]*$/, "");
};
