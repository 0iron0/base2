
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var _PIXEL   = /^\d+(px)?$/i;
var _METRICS = /(width|height|top|bottom|left|right|fontSize)$/;
var _COLOR   = /^(color|backgroundColor)$/;
var _RUBY    = /^ruby/;

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var currentStyle = element.currentStyle;
        var computedStyle = {};
        for (var i in currentStyle) {
          if (_METRICS.test(i) || _COLOR.test(i)) {
            computedStyle[i] = this.getComputedPropertyValue(view, element, i);
          } else if (!_RUBY.test(i)) {
            computedStyle[i] = currentStyle[i];
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
      if (_METRICS.test(propertyName))
        return _MSIE_getPixelValue(element, element.currentStyle[propertyName]) + "px";
      if (_COLOR.test(propertyName))
        return _MSIE_getColorValue(element, propertyName == "color" ? "ForeColor" : "BackColor");
      return element.currentStyle[propertyName];
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

function _MSIE_getColorValue(element, value) {
  // -dean: elements need to have "layout" for this to work.
  var range = element.document.body.createTextRange();
  range.moveToElementText(element);
  var color = range.queryCommandValue(value);
  return format("rgb(%1, %2, %3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
};
