
var HTMLElement = Element.extend(null, {
  bindings: {},
  tags: "*",

  bind: function(element) {
    if (!element.classList) {
      element.classList = new _ElementClassList(element);
    }
    if (!element.ownerDocument) {
      element.ownerDocument = Traversal.getOwnerDocument(element);
    }
    /*@if (@_jscript)
      for (var name, i = 0; name = _PREFIXES[i]; i++) {
        name += "Attribute";
        element["_" + name] = element[name];
      }
    /*@end @*/
    return this.base(element);
  },

  extend: function() {
    // Maintain HTML element bindings.
    // This allows us to map specific interfaces to elements by reference
    // to tag name.
    var binding = this.base.apply(this, arguments);
    forEach.csv(binding.tags, function(tagName) {
      HTMLElement.bindings[tagName] = binding;
    });
    return binding;
  }
});

HTMLElement.extend(null, {
  tags: "APPLET,EMBED,OBJECT,IFRAME",
  bind: I // Binding not allowed for these elements.
});

// Build HTMLElement.prototype using global functions to avoid memory leaks.

var _PREFIXES = "get,set,has,remove".split(",");

/*@if (@_jscript_version < 5.7)
  for (var i in HTMLElement.prototype) {
    if (i != "base" && i != "extend") {
      HTMLElement.prototype[i] = new Function("var a=base2.js.Array2.slice(arguments),m=base2.dom.HTMLElement."+i+";a.unshift(this);return m.apply(m,a)");
    }
  }
/*@end @*/
