
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration

var _CSSStyleDeclaration_ReadOnly = Binding.extend({
  getPropertyValue: function(style, propertyName) {
    return this.base(style, _CSSPropertyNameMap[propertyName] || propertyName);
  },
  
  "@MSIE.+win": {
    getPropertyValue: function(style, propertyName) {
      return style[ViewCSS.toCamelCase(propertyName)];
    }
  }
});

var CSSStyleDeclaration = _CSSStyleDeclaration_ReadOnly.extend({
  setProperty: function(style, propertyName, value, important) {
    return this.base(style, _CSSPropertyNameMap[propertyName] || propertyName, value, important);
  },
  
  "@MSIE.+win": {
    setProperty: function(style, propertyName, value, priority) {
      if (propertyName == "opacity") {
        style.opacity = value;
        style.zoom = 1;
        style.filter = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + (value * 100) + ")";
      } else {
        style.cssText += format("%1:%2 %3;", propertyName, value, priority);
      }
    }
  }
});

var _CSSPropertyNameMap = new Base({
  "@Gecko": {
    opacity: "-moz-opacity"
  },
  
  "@KHTML": {
    opacity: "-khtml-opacity"
  }
});
