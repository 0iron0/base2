
var _PREFIX = detect("Webkit") ? "-webkit-" : "-moz-";

var PX = "px";

var _ACTIVE = "\x5factive",
    _HOVER  = "\x5fhover",
    _FOCUS  = "\x5ffocus",
    _TIMER  = "\x5ftimer";

var _timers   = {}, // store for timeouts
    _vertical = {}; // vertical controls

function _resetScroll() {
  this.scrollTop = 0;
};

var _preventScroll = {
  onfocus: function(element) {
    if (!element.onscroll) {
      element.onscroll = _resetScroll;
      element.onscroll();
    }
    this.base(element);
  }
};

var _WIDTH  = "clientWidth",
    _HEIGHT = "clientHeight";

var _EVENT  = /^on(DOM\w+|[a-z]+)$/;
