
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration

var _CSSStyleDeclaration_ReadOnly = Binding.extend({
  getPropertyValue: function(style, propertyName) {
    if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
    return style[propertyName] || "";
  },

  "@MSIE5": {
    getPropertyValue: function(style, propertyName) {
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      var value = style[propertyName];
      if (propertyName == "cursor" && value == "hand") {
        value = "pointer";
      }
      return value || "";
    }
  }
});

var CSSStyleDeclaration = _CSSStyleDeclaration_ReadOnly.extend({
  setProperty: function(style, propertyName, value, priority) {
    if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
    if (priority) {
      this.base(style, propertyName.replace(_CHAR_UPPER, _dash_lower), value, priority);
    } else {
      style[propertyName] = value;
    }
  },

  "@!(style['setProperty'])": {
    setProperty: function(style, propertyName, value, priority) {
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      /*@if (@_jscript)
        if (@_jscript_version < 5.6 && propertyName == "cursor" && value == "pointer") {
          value = "hand";
        } else if (propertyName == "opacity") {
          value *= 100;
          style.zoom = "100%";
          style.filter = "alpha(opacity=" + Math.round(value) + ")";
        }
      /*@end @*/
      if (priority == "important") {
        style.cssText += format(";%1:%2!important;", propertyName.replace(_CHAR_UPPER, _dash_lower), value);
      } else {
        style[propertyName] = value;
      }
    }
  }
}, {
  getPropertyName: _getPropertyName,

  setProperties: function(style, properties) {
    properties = extend({}, properties);
    for (var propertyName in properties) {
      var value = properties[propertyName];
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      if (typeof value == "number" && _METRICS.test(propertyName)) value += "px";
      if (_SPECIAL[propertyName]) {
        this.setProperty(style, propertyName, value, "");
      } else {
        style[propertyName] = value;
      }
    }
  }
});
