
var PX = "px";

var _ACTIVE = "\x5factive",
    _HOVER  = "\x5fhover",
    _FOCUS  = "\x5ffocus",
    _TIMER  = "\x5ftimer";

var _timers   = {}, // store for timeouts
    _vertical = {}, // vertical controls
    _preventScroll = {
      onfocus: function(element, event) {
        if (!element.onscroll) {
          element.scrollTop = 0;
          element.onscroll = _resetScroll;
        }
        this.base(element, event);
      }
    };

function _resetScroll() {
  this.scrollTop = 0;
};

function _layout(element) {
  this.layout(element);
};

var _WIDTH  = "clientWidth",
    _HEIGHT = "clientHeight";

var _EVENT  = /^on(DOM\w+|[a-z]+)$/,
    _TEXT   = Traversal.TEXT;

function pad(number, length) {
  return "0000".slice(0, (length || 2) - String(number).length) + number;
};

var _document = document,
    _documentElement = _document.documentElement;

if (window.pageXOffset == null) {
  var _CLIENT      = _documentElement,
      _SCROLL_LEFT = "scrollLeft",
      _SCROLL_TOP  = "scrollTop";
} else {
      _CLIENT      = window;
      _SCROLL_LEFT = "pageXOffset";
      _SCROLL_TOP  = "pageYOffset";
}

if (detect("(style.MozBorderImage!==undefined||style.WebkitBorderImage!==undefined)")) {
  base2.userAgent += ";borderImage=true";
}
