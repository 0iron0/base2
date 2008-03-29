
var _MSIE  = detect("MSIE"),
    _OPERA = detect("opera");

var PX = "px";

var _ACTIVE = "_active",
    _HOVER  = "_hover",
    _FOCUS  = "_focus",
    _TIMER  = "_timer";

var _timers   = {}, // store for timeouts
    _values   = {}, // store for computed values
    _vertical = {}; // vertical controls

function _resetScroll() {
  this.scrollTop = 0;
};
