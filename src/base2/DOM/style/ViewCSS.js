
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var _NUMBER  = /\d/,
    _PIXEL   = /^\d+(px)?$/i,
    _METRICS = /(width|height|top|bottom|left|right|fontSize)$/i,
    _COLOR   = /color$/i,
    _BLACK   = "rgb(0, 0, 0)";

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@MSIE": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var style = element.style,
            currentStyle = element.currentStyle,
            computedStyle = {};
        for (var propertyName in style) {
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
  },
  
  "@Opera": {
    getComputedStyle: function(view, element, pseudoElement) {
      var computedStyle = this.base(view, element, pseudoElement);
      var fixedStyle = pcopy(computedStyle);
      for (var i in computedStyle) {
        if (_COLOR.test(i)) fixedStyle[i] = _toRGB(computedStyle[i]);
        else if (typeof computedStyle[i] == "function") {
          fixedStyle[i] = bind(i, computedStyle);
        }
      }
      return fixedStyle;
    }
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
        return _MSIE_getPixelValue(element, value);
      if (!_MSIE5 && _COLOR.test(propertyName)) {
        switch (value) {
          case "black":
            return _BLACK;
          case "white":
            return "rgb(255, 255, 255)";
          case "transparent":
            return value;
          default:
            var rgb = _MSIE_getColorValue(element, propertyName == "color" ? "ForeColor" : "BackColor");
            return rgb == _BLACK ? _toRGB(value) : rgb;
        }
      }
      return value;
    }
  },
  
  toCamelCase: function(string) {
    return string.replace(/\-([a-z])/g, flip(String2.toUpperCase));
  }
});

function _MSIE_getPixelValue(element, value) {
  if (value == "none") return "0px";
  if (!_NUMBER.test(value) || _PIXEL.test(value) || value.indexOf(" ") != -1) return value;
  var styleLeft = element.style.left;
  var runtimeStyleLeft = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value || 0;
  value = element.style.pixelLeft;
  element.style.left = styleLeft;
  element.runtimeStyle.left = runtimeStyleLeft;
  return value + "px";
};

function _MSIE_getColorValue(element, type) {
  if (element == element.document.documentElement) return _BLACK;
  // elements need to have "layout" for this to work.
  var zoom = element.style.zoom;
  if (!element.currentStyle.hasLayout) {
    element.style.zoom = "100%"; // runtimeStyle is screwy fro zoom
  }
  if (element.createTextRange) {
    var range = element.createTextRange();
  } else {
    range = element.document.body.createTextRange();
    range.moveToElementText(element);
  }
  var color = range.queryCommandValue(type);
  element.style.zoom = zoom;
  return format("rgb(%1, %2, %3)", color & 0xff, (color & 0xff00) >> 8,  (color & 0xff0000) >> 16);
};

function _toRGB(value) {
  if (value.indexOf("#") != 0) return value;
  var hex = value.slice(1);
  if (hex.length == 3) hex = hex.replace(/(\w)/g, "$1$1");
  return "rgb(" + Array2.map(hex.match(/(\w\w)/g), partial(parseInt, undefined, 16)).join(", ") + ")";
};
