
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var _PIXEL     = /^\d+(px)?$/i,
    _METRICS   = /(width|height|top|bottom|left|right|fontSize)$/,
    _COLOR     = /^(color|backgroundColor)$/,
    _RGB_BLACK = "rgb(0, 0, 0)",
    _BLACK     = {black:1, "#000":1, "#000000":1};

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var currentStyle = element.currentStyle;
        var computedStyle = {};
        for (var propertyName in currentStyle) {
          if (_METRICS.test(propertyName) || _COLOR.test(propertyName)) {
            computedStyle[propertyName] = this.getComputedPropertyValue(view, element, propertyName);
          } else if (propertyName.indexOf("ruby") != 0) {
            computedStyle[propertyName] = currentStyle[propertyName];
          }
        }
        return computedStyle;
      }
    }
  },
  
  getComputedStyle: function(view, element, pseudoElement) {
    return _CSSStyleDeclaration_ReadOnly.bind(this.base(view, element, pseudoElement));
  }
}, {
  getComputedPropertyValue: function(view, element, propertyName) {
    return CSSStyleDeclaration.getPropertyValue(this.getComputedStyle(view, element, null), propertyName);
  },
  
  "@MSIE": {
    getComputedPropertyValue: function(view, element, propertyName) {
      propertyName = this.toCamelCase(propertyName);
      var value = element.currentStyle[propertyName];
      if (_METRICS.test(propertyName))
        return _MSIE_getPixelValue(element, value) + "px";
      if (!_MSIE5 && _COLOR.test(propertyName)) {
        var rgb = _MSIE_getColorValue(element, propertyName == "color" ? "ForeColor" : "BackColor");
        return (rgb == _RGB_BLACK && !_BLACK[value]) ? value : rgb;
      }
      return value;
    }
  },
  
  toCamelCase: function(string) {
    return string.replace(/\-([a-z])/g, flip(String2.toUpperCase));
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

function _MSIE_getColorValue(element, type) {
  // elements need to have "layout" for this to work.
  if (element.createTextRange) {
    var range = element.createTextRange();
  } else {
    range = element.document.body.createTextRange();
    range.moveToElementText(element);
  }
  var color = range.queryCommandValue(type);
  return format("rgb(%1, %2, %3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
};
