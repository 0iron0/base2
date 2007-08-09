
var Document = Node.extend(null, {
  bind: function(document) {
    this.base(document);
    extend(document, "createElement", function(tagName) { //-dean- test this!
      return DOM.bind(this.base(tagName));
    });
    AbstractView.bind(document.defaultView);
    return document;
  },
  
  "@!(document.defaultView)": {
    bind: function(document) {
      document.defaultView = Traversal.getDefaultView(document);
      return this.base(document);
    }
  }
});

// provide these as pass-through methods
Document.createDelegate("createElement", 2);
