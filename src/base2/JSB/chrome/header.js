
var _MSIE  = detect("MSIE");

var PX = "px";

var _ACTIVE = "\x5factive",
    _HOVER  = "\x5fhover",
    _FOCUS  = "\x5ffocus",
    _TIMER  = "\x5ftimer";

var _timers   = {}, // store for timeouts
    _values   = {}, // store for computed values
    _vertical = {}; // vertical controls

function _resetScroll() {
  this.scrollTop = 0;
};

var _WIDTH = "clientWidth";
var _HEIGHT = "clientHeight";
