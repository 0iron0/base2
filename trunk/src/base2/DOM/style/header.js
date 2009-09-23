
var _NUMBER  = /\d/,
    _PIXEL   = /\dpx$/i,
    _METRICS = /(width|height|top|bottom|left|right|fontSize)$/i,
    _COLOR   = /color$/i;

var _DASH = /\-/,
    _DASH_LOWER = /\-([a-z])/g,
    _CHAR_UPPER = /[A-Z]/g;

var _NAMED_BORDER_WIDTH = {
  thin: 1,
  medium: 2,
  thick: 4
};

var _SPECIAL = {
  "@MSIE": {
    opacity: 1,
    cursor: 1
  }
};

var _getPropertyName = function(propertyName, asAttribute) {
  if (propertyName == "float" || propertyName == "cssFloat" || propertyName == "styleFloat") {
    return asAttribute ? "float" : _style.cssFloat == null ? "styleFloat" : "cssFloat";
  }
  if (_DASH.test(propertyName)) {
    propertyName = propertyName.replace(_DASH_LOWER, _toUpperCase);
  }
  if (_style[propertyName] == null) {
    var borderRadiusCorner = /^border(\w+)Radius$/;
    if (ViewCSS.prefix == "Moz" && borderRadiusCorner.test(propertyName)) {
      propertyName = propertyName.replace(borderRadiusCorner, function(match, corner) {
        return "borderRadius" + corner.charAt(0) + corner.slice(1).toLowerCase();
      });
    }
    var vendorPropertyName = ViewCSS.prefix + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    if (_style[vendorPropertyName] != null) {
      propertyName = vendorPropertyName;
    }
  }
  if (asAttribute) {
    propertyName = propertyName.replace(_CHAR_UPPER, _dash_lower);
  }
  return propertyName;
};

function _dash_lower(chr) {
  return "-" + chr.toLowerCase();
};

var _toUpperCase = flip(String2.toUpperCase),
    _parseInt16  = partial(parseInt, undefined, 16);

function _MSIE_getPixelValue(element, value) {
  var styleLeft = element.style.left;
  var runtimeStyleLeft = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value;
  value = element.style.pixelLeft;
  element.style.left = styleLeft;
  element.runtimeStyle.left = runtimeStyleLeft;
  return value + "px";
};

function _MSIE_getColorValue(color) {
  if (window.createPopup) {
    var document = createPopup().document;
  } else {
    document = new ActiveXObject("htmlfile");
    document.write("<body>");
  }
  var body  = document.body,
      range = body.createTextRange();
  body.style.color = color.toLowerCase();
  var value = range.queryCommandValue("ForeColor");
  return format("rgb(%1, %2, %3)", value & 0xff, (value & 0xff00) >> 8,  (value & 0xff0000) >> 16);
};

function _toRGB(value) {
  if (value.indexOf("rgb") == 0) return value.replace(/(\d)\s,/g, "$1,");
  if (value.indexOf("#") != 0) return value;
  var hex = value.slice(1);
  if (hex.length == 3) hex = hex.replace(/(\w)/g, "$1$1");
  return "rgb(" + Array2.map(hex.match(/(\w\w)/g), _parseInt16).join(", ") + ")";
};
