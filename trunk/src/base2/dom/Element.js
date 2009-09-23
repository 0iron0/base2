
// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

// Damn. Attributes are hard. All the browsers disagree on how it should be done.

detect("(element.className='test',element.expando=true)"); // Initialise feature detection

var Element = Node.extend({
  // The spec says return an empty string, most browsers disagree and return null.
  // base2 agrees with most browsers.
  "@(element.getAttribute('made-up')===''||element.getAttribute('id')!=null||element.getAttribute('expando'))": {
    getAttribute: function(element, name) {
      var attribute = _getAttributeNode(element, name),
          specified = attribute && attribute.specified;
      /*@if (@_jscript)
        if (element.nodeName == "INPUT" && _USE_OUTER_HTML.test(name) && element.outerHTML) {
          var outerHTML = element.outerHTML || "";
          with (outerHTML) outerHTML = slice(0, indexOf(">") + 1);
          return match(outerHTML, name == "type" ? _MATCH_TYPE : _MATCH_VALUE)[1] || null;
        }
        if ((specified && _USE_IFLAG.test(name)) || (!attribute && @_jscript_version < 5.6)) {
          var method = "getAttribute";
          if (element["_" + method]) method = "_" + method;
          return element[method](name, 2);
        }
      /*@end @*/
      if (specified) {
        /*@if (@_jscript)
          if (name == "style") return element.style.cssText.toLowerCase();
        /*@end @*/
        return attribute.nodeValue;
      }
      return null;
    },

    hasAttribute: function(element, name) {
      return this.getAttribute(element, name) != null;
    }
  },

  // MSIE5-7 has its own weird dictionary of attribute names
  "@!(element.getAttribute('class'))": {
    removeAttribute: function(element, name) {
      name = _ATTRIBUTES[name.toLowerCase()] || name;
      /*@if (@_jscript)
        var method = "removeAttribute";
        if (element["_" + method]) method = "_" + method;
        element[method](name);
      @else @*/
        this.base(element, name);
      /*@end @*/
    },

    setAttribute: function(element, name, value) {
      name = _ATTRIBUTES[name.toLowerCase()] || name;
      /*@if (@_jscript)
        if (name == "style") {
          element.style.cssText = value;
        } else {
          var method = "setAttribute";
          if (element["_" + method]) method = "_" + method;
          element[method](name, String(value));
        }
      @else @*/
        this.base(element, name, value);
      /*@end @*/
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: function(element, name) {
      return this.getAttribute(element, name) != null;
    }
  },

  // A base2 extension the was originally in the Selectors API spec
  "@!(element.matchesSelector)": {
    matchesSelector: function(element, selector) {
      return new Selector(selector).test(element);
    }
  }
}, {
  "@Gecko": {
    bind: _gecko_bind
  }
});
