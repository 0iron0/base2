
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        var METRICS = /(width|height|top|bottom|left|right|fontSize)$/;
        var COLOR = /^(color|backgroundColor)$/;
        // pseudoElement parameter is not supported
        var computedStyle = {};
        var currentStyle = element.currentStyle;
        for (var i in currentStyle) {
          if (METRICS.test(i)) {
            computedStyle[i] = this.$getPixelValue(element, computedStyle[i]) + "px";
          } else if (COLOR.test(i)) {
            computedStyle[i] = this.$getColorValue(element, i == "color" ? "ForeColor" : "BackColor");
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
    return String(string).replace(/\-([a-z])/g, function(match, chr) {
      return chr.toUpperCase();
    });
  },
  
  "@MSIE": {
    $getPixelValue: function(element, value) {
      var PIXEL = /^\d+(px)?$/i;
      if (PIXEL.test(value)) return parseInt(value);
      var styleLeft = element.style.left;
      var runtimeStyleLeft = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = styleLeft;
      element.runtimeStyle.left = runtimeStyleLeft;
      return value;
    },
    
    $getColorValue: function(element, value) {
      var range = element.document.body.createTextRange();
      range.moveToElementText(element);
      var color = range.queryCommandValue(value);
      return format("rgb(%1,%2,%3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
    }
  }
});
