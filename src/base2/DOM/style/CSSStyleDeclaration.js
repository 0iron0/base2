
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration

var _CSSStyleDeclaration_ReadOnly = Binding.extend({
  getPropertyValue: function(style, propertyName) {
    propertyName = _CSSPropertyNameMap[propertyName] || propertyName;
    var value = style[propertyName];
    if (value == undefined) value = this.base(style, propertyName);
    if (_COLOR.test(propertyName)) value = _toRGB(value);
    return value;
  },
  
  "@MSIE.+win": {
    getPropertyValue: function(style, propertyName) {
      return propertyName == "float" ? style.styleFloat : style[ViewCSS.toCamelCase(propertyName)];
    }
  }
});

var CSSStyleDeclaration = _CSSStyleDeclaration_ReadOnly.extend({
  setProperty: function(style, propertyName, value, priority) {
    propertyName = _CSSPropertyNameMap[propertyName] || propertyName;
    this.base(style, propertyName.replace(/[A-Z]/g, _dash_lower), value, priority);
  },
  
  "@MSIE.+win": {
    setProperty: function(style, propertyName, value, priority) {
      if (propertyName == "opacity") {
        style.opacity = value;
        value *= 100;
        style.zoom = 1;
        style.filter = "Alpha(opacity=" + value + ")";
      } else {
        if (priority == "important") {
          style.cssText += format(";%1:%2!important;", propertyName, value);
        } else {
          style.setAttribute(ViewCSS.toCamelCase(propertyName), value);
        }
      }
    }
  }
}, {
  "@MSIE": {
    bind: function(style) {
      style.getPropertyValue = this.prototype.getPropertyValue;
      style.setProperty = this.prototype.setProperty;
      return style;
    }
  }
});

function _dash_lower(string) {
  return "-" + string.toLowerCase();
};

var _CSSPropertyNameMap = new Base({
  "@Gecko": {
    opacity: "-moz-opacity"
  },

  "@KHTML": {
    opacity: "-khtml-opacity"
  }
});

with (CSSStyleDeclaration.prototype) getPropertyValue.toString = setProperty.toString = K("[base2]");
