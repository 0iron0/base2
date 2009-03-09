
var PX = "px";

var _ACTIVE = "\x5factive",
    _HOVER  = "\x5fhover",
    _FOCUS  = "\x5ffocus",
    _TIMER  = "\x5ftimer";

var _timers   = {}, // store for timeouts
    _vertical = {}, // vertical controls
    _preventScroll = {
      onfocus: function(element) {
        if (!element.onscroll) {
          element.onscroll = _resetScroll;
          element.onscroll();
        }
        this.base.apply(this, arguments);
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
  return "0000".slice(0, length - String(number).length) + number;
};
