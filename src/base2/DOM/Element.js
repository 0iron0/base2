
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var _ATTRIBUTES = {
  "class": "className",
  "for": "htmlFor"
};

var Element = Node.extend({
  "@MSIE.+win": {
    getAttribute: function(element, name) {
      if (element.className === undefined) { // XML
        return this.base(element, name);
      }
      var attribute = _getAttributeNode(element, name);
      if (attribute && (attribute.specified || name == "value")) {
        if (name == "href" || name == "src") {
          //element.base = element.getAttribute.ancestor;
          //return element[element.base ? "base" : "getAttribute"](name, 2);
          var ancestor = element.getAttribute.ancestor;
          if (ancestor) element.base = ancestor;
          return element[element.base ? "base" : "getAttribute"](name, 2);
        } else if (name == "style") {
         return element.style.cssText.toLowerCase();
        } else {
         return attribute.nodeValue;
        }
      } else if (name == "type" && element.nodeName == "INPUT") {
        var outerHTML = element.outerHTML;
        with (outerHTML) outerHTML = slice(0, indexOf(">") + 1);
        return match(outerHTML, /type="?([^\s">]*)"?/i)[1] || "text";
      }
      return null;
    },

    removeAttribute: function(element, name) {
      if (element.className !== undefined) { // XML
        name = _ATTRIBUTES[name.toLowerCase()] || name;
      }
      this.base(element, name);
    },

    setAttribute: function(element, name, value) {
      if (element.className === undefined) { // XML
        this.base(element, name, value);
      } else if (name == "style") {
        element.style.cssText = value;
      } else {
        value = String(value);
        var attribute = _getAttributeNode(element, name);
        if (attribute) {
          attribute.nodeValue = value;
        } else {
          this.base(element, _ATTRIBUTES[name.toLowerCase()] || name, value);
        }
      }
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: function(element, name) {
      if (element.className === undefined) { // XML
        return this.base(element, name);
      }
      return this.getAttribute(element, name) != null;
    }
  },
  
  "@!(element.matchesSelector)": {
    matchesSelector: function(element, selector) {
      return new Selector(selector).test(element);
    }
  }
});

// remove the base2ID for clones
if (detect("MSIE.+win")) extend(Element.prototype, "cloneNode", function(deep) {
  var clone = this.base(deep || false);
  clone.base2ID = undefined;
  return clone;
});

var _HTML_ATTRIBUTES = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
// Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
extend(_ATTRIBUTES, Array2.combine(_HTML_ATTRIBUTES.toLowerCase().split(","), _HTML_ATTRIBUTES.split(",")));

var _getAttributeNode = document.documentElement.getAttributeNode ? function(element, name) {
  return element.getAttributeNode(name);
} : function(element, name) {
  return element.attributes[name] || element.attributes[_ATTRIBUTES[name.toLowerCase()]];
};
