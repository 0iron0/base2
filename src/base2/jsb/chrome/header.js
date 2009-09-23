
var PX = "px";

var _ACTIVE = "\x5factive",
    _HOVER  = "\x5fhover",
    _FOCUS  = "\x5ffocus",
    _TIMER  = "\x5ftimer";

var _EVENT          = /^on(DOM\w+|[a-z]+)$/,
    _TEXT_CONTENT   = Traversal.TEXT_CONTENT;

var _DAY = 86400000;

var _PARENT = detect("(element.parentElement)") ? "parentElement" : "parentNode";

var _attachments   = {},
    _timers        = {};

var  _preventScroll = {
  onfocus: function(element, event) {
    if (!element.onscroll) {
      element.scrollTop = 0;
      element.onscroll = _resetScroll;
    }
    this.base(element, event);
  }
};

var _resetScroll = function() {
  this.scrollTop = 0;
};

function pad(number, length) {
  return "0000".slice(0, (length || 2) - String(number).length) + number;
};

function wrap(items, tagName, attributes) {
  return reduce(items, function(html, text) {
    return html += "<" + tagName + " " + attributes + ">" + text + "</" + tagName + ">";
  }, "");
};
