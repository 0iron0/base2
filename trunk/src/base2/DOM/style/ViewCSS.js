
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var _PIXEL   = /^\d+(px)?$/i;
var _METRICS = /(width|height|top|bottom|left|right|fontSize)$/;
var _COLOR   = /^(color|backgroundColor)$/;

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var currentStyle = element.currentStyle;
        var computedStyle = {
          getPropertyValue: function(propertyName) {
            return this[ViewCSS.toCamelCase(propertyName)];
          }
        };
        for (var i in currentStyle) {
          if (_METRICS.test(i)) {
            computedStyle[i] = _MSIE_getPixelValue(element, computedStyle[i]) + "px";
          } else if (_COLOR.test(i)) {
            computedStyle[i] = _MSIE_getColorValue(element, i == "color" ? "ForeColor" : "BackColor");
          } else {
            computedStyle[i] = currentStyle[i];
          }
        }
        return computedStyle;
      }
    }
  }
}, {
  toCamelCase: function(string) {
    return string.replace(/\-([a-z])/g, function(match, chr) {
      return chr.toUpperCase();
    });
  }
});

function _MSIE_getPixelValue(element, value) {
  if (_PIXEL.test(value)) return parseInt(value);
  var styleLeft = element.style.left;
  var runtimeStyleLeft = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value || 0;
  value = element.style.pixelLeft;
  element.style.left = styleLeft;
  element.runtimeStyle.left = runtimeStyleLeft;
  return value;
};

function _MSIE_getColorValue(element, value) {
  var range = element.document.body.createTextRange();
  range.moveToElementText(element);
  var color = range.queryCommandValue(value);
  return format("rgb(%1,%2,%3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
};
