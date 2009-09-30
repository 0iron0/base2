
var _SUPPORTS_BORDER_BOX = detect("QuirksMode") || (7 != document.documentMode && detect("(style.boxSizing)"));
    
var _HOST          = jsb.host,
    _IMAGES_URL    = _HOST + "images/",
    _OPEN_IMAGE    = _IMAGES_URL + "arrow-up.png",
    _CLOSED_IMAGE  = _IMAGES_URL + "arrow-down.png";

var _PERCENT       = "[%\u066a\ufe6a\uff05\u2030\u2031]",
    _PARSE_RATIO   = new RegExp("([\\d.]+" + _PERCENT + "?)|([\\d.]+).+([\\d.]+)", "g");
    _PERCENT       = new RegExp(_PERCENT);
    
// Indexes to values returned by getRatio().
var _VALUE = 0, _MAX = 1;

var _styleSheet = {
  "source,command,[hidden],[repeat=template]": {
    display: "none!"
  }
};

var _rules = {};
