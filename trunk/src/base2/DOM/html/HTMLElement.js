
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
    return this.base(element);
  },

  extend: function() {
    // Maintain HTML element bindings.
    // This allows us to map specific interfaces to elements by reference
    // to tag name.
    var binding = base(this, arguments);
    var tags = String2.csv(binding.tags);
    forEach (tags, function(tagName) {
      HTMLElement.bindings[tagName] = binding;
    });
    return binding;
  }
});

HTMLElement.extend(null, {
  tags: "APPLET,EMBED",  
  bind: I // Binding not allowed for these elements.
});
