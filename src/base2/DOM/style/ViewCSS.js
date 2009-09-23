
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Interface.extend({
  "@!(document.defaultView.getComputedStyle)": {
    "@(element.currentStyle)": {
      getComputedStyle: function(view, element, pseudoElement) {
        // pseudoElement parameter is not supported
        var currentStyle  = element.currentStyle,
            computedStyle = _CSSStyleDeclaration_ReadOnly.bind({});
            
        for (var propertyName in currentStyle) {
          if (_METRICS.test(propertyName) || _COLOR.test(propertyName)) {
            computedStyle[propertyName] = this.getComputedPropertyValue(view, element, propertyName);
          } else if (propertyName.indexOf("ruby") != 0) {
            computedStyle[propertyName] = currentStyle[propertyName];
          }
        }
        forEach.csv("backgroundPosition,boxSizing,clip,cssFloat,opacity", function(propertyName) {
          computedStyle[propertyName] = this.getComputedPropertyValue(view, element, propertyName);
        }, this);
        
        return computedStyle;
      }
    }
  }
}, {
  prefix: "",
  "@Gecko":  {prefix: "Moz"},
  "@KHTML":  {prefix: "Khtml"},
  "@Webkit": {prefix: "Webkit"},
  "@Opera":  {prefix: "O"},
  "@MSIE":   {prefix: "Ms"},
  
  getComputedPropertyValue: function(view, element, propertyName) {
    var value = CSSStyleDeclaration.getPropertyValue(this.getComputedStyle(view, element, null), propertyName);
    if (_COLOR.test(propertyName)) value = _toRGB(value);
    return value;
  },

  "@!(document.defaultView.getComputedStyle)": {
    "@(element.currentStyle)": {
      getComputedPropertyValue: function(view, element, propertyName) {
        var currentStyle  = element.currentStyle,
            value = currentStyle[propertyName];

        if (value == null) {
          propertyName = _getPropertyName(propertyName);
          value = currentStyle[propertyName] || "";
        }
        
        /*if (value == "inherit") {
          var parentNode = element.parentNode;
          if (parentNode && parentNode.currentStyle) {
            value = this.getComputedPropertyValue(view, parentNode, propertyName) || value;
          }
        }*/
        
        switch (propertyName) {
          case "float":
          case "cssFloat":
            return currentStyle.cssFloat || currentStyle.styleFloat || "";
          case "cursor":
            return value == "hand" ? "pointer" : value;
          case "opacity":
            return value == null ? "1" : value;
          case "clip":
            return "rect(" + [
              currentStyle.clipTop,
              currentStyle.clipRight,
              currentStyle.clipBottom,
              currentStyle.clipLeft
            ].join(", ") + ")";
          case "backgroundPosition":
            return currentStyle.backgroundPositionX + " " + currentStyle.backgroundPositionY;
          case "boxSizing":
            return value == null ?
              /^CSS/.test(Traversal.getDocument(element).compatMode) ?
                "content-box" : "border-box" : value;
        }

        if (value.indexOf(" ") > 0) return value;
        
        if (_METRICS.test(propertyName)) {
          if (_PIXEL.test(value)) return value;
          if (value == "auto") return "0px";
          if (propertyName.indexOf("border") == 0) {
            if (currentStyle[propertyName.replace("Width", "Style")] == "none") return "0px";
            value = _NAMED_BORDER_WIDTH[value] || value;
            if (typeof value == "number") return value + "px";
          }
          /*@if (@_jscript)
            if (_NUMBER.test(value)) return _MSIE_getPixelValue(element, value);
          /*@end @*/
        } else if (_COLOR.test(propertyName)) {
          if (value == "transparent") return value;
          if (/^(#|rgb)/.test(value)) return _toRGB(value);
          /*@if (@_jscript)
            return _MSIE_getColorValue(value);
          /*@end @*/
        }
        
        return value;
      }
    }
  }
});
