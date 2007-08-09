
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// I'm going to fix getAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var Element = Node.extend({
  "@MSIE[67]": {
    getAttribute: function(element, name, iFlags) {
      if (element.className === undefined || name == "href" || name == "src") {
        return this.base(element, name, 2);
      }
      var attribute = element.getAttributeNode(name);
      return attribute && attribute.specified ? attribute.nodeValue : null;
    }
  },
  
  "@MSIE5.+win": {
    getAttribute: function(element, name, iFlags) {
      if (element.className === undefined || name == "href" || name == "src") {
        return this.base(element, name, 2);
      }
      var attribute = element.attributes[this.$attributes[name.toLowerCase()] || name];
      return attribute ? attribute.specified ? attribute.nodeValue : null : this.base(element, name);
    }
  }
}, {
  $attributes: {},
  
  "@MSIE5.+win": {
    init: function() {
      // these are the attributes that IE is case-sensitive about
      // convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
      var attributes = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
      // combine two arrays to make a hash
      var keys = attributes.toLowerCase().split(",");
      var values = attributes.split(",");
      this.$attributes = Array2.combine(keys, values);
    }
  }
});

Element.createDelegate("setAttribute", 3);
