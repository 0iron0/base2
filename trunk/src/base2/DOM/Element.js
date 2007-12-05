
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// Fix get/setAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var _EVALUATED = /^(href|src|type|value)$/;
var _ATTRIBUTES = {
  "class": "className",
  "for": "htmlFor"
};

var Element = Node.extend({
  "@MSIE.+win": {
    getAttribute: function(element, name, iFlags) {
      if (element.className === undefined) { // XML
        return this.base(element, name);
      }
      var attribute = _MSIE_getAttributeNode(element, name);
      if (attribute && attribute.specified) {
        if (_EVALUATED.test(name)) {
          return this.base(element, name, 2);
        } else if (name == "style") {
         return element.style.cssText;
        } else {
         return attribute.nodeValue;
        }
      }
      return null;
    },
    
    setAttribute: function(element, name, value) {
      if (element.className === undefined) { // XML
        this.base(element, name, value);
      } else if (name == "style") {
        element.style.cssText = value;
      } else {
        this.base(element, _ATTRIBUTES[name] || name, String(value));
      }
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: function(element, name) {
      return this.getAttribute(element, name) != null;
    }
  }
});

// remove the base2ID for clones
extend(Element.prototype, "cloneNode", function(deep) {
  var clone = this.base(deep || false);
  clone.base2ID = undefined;
  return clone;
});

if (_MSIE) {
  var names = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
  // Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
  extend(_ATTRIBUTES, Array2.combine(names.toLowerCase().split(","), names.split(",")));
  
  var _MSIE_getAttributeNode = _MSIE5 ? function(element, name) {
    return element.attributes[name] || element.attributes[_ATTRIBUTES[name.toLowerCase()]];
  } : function(element, name) {
    return element.getAttributeNode(name);
  };
}
