
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
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.7) {
    for (var i in this.prototype) {
      if (i != "base" && i != "extend") {
        var ancestor = element[i];
        element[i] = this.prototype[i];
        element[i].ancestor = ancestor;
      }
    }
    // http://www.hedgerwow.com/360/dhtml/ie6_memory_leak_fix/
    try {
      return element;
    } finally {
      element = null;
    }
  }
  @else @*/
    return this.base(element);
  /*@end @*/
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
  tags: "APPLET,EMBED",  
  bind: I // Binding not allowed for these elements.
});

/*@if (@_jscript_version < 5.7)
  for (var i in HTMLElement.prototype) {
    if (i != "base" && i != "extend") {
      HTMLElement.prototype[i] = new Function("var a=base2.JavaScript.Array2.slice(arguments),m=base2.DOM.HTMLElement."+i+";a.unshift(this);return m.apply(m,a)");
    }
  }
/*@end @*/
