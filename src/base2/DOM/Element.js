
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// Fix get/setAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var Element = Node.extend({
  "@MSIE.+win": {
    getAttribute: function(element, name, iFlags) {
      if (element.className === undefined) { // XML
        return this.base(element, name);
      }
      var attribute = this.$getAttributeNode(element, name);
      if (attribute && attribute.specified) {
        if (this.$EVALUATED.test(name)) {
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
        this.base(element, this.$attributes[name] || name, String(value));
      }
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: function(element, name) {
      return this.getAttribute(element, name) != null;
    }
  }
}, {
  $EVALUATED: /^(href|src|type|value)$/,
  $attributes: {
    "class": "className",
    "for": "htmlFor"
  },
  
  "@MSIE.+win": {
    init: function() {
      // These are the attribute names that IE is case-sensitive about.
      var names = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
      // Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
      var attributes = Array2.combine(names.toLowerCase().split(","), names.split(","));
      extend(this.$attributes, attributes);
    },
    
    $getAttributeNode: function(element, name) {
      return element.getAttributeNode(name);
    },
  
    "@MSIE5": {
      $getAttributeNode: function(element, name) {
        return element.attributes[name] || element.attributes[this.$attributes[name.toLowerCase()]];
      }
    }
  }
});

// remove the base2ID for clones
extend(Element.prototype, "cloneNode", function(deep) {
  var clone = this.base(deep || false);
  clone.base2ID = undefined;
  return clone;
});
