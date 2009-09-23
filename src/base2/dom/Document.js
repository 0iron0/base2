
var Document = Node.extend(null, {
  bind: function(document) {
    extend(document, "createElement", function(tagName) {
      return dom.bind(this.base(tagName));
    });
    if (!document.defaultView) {
      document.defaultView = Traversal.getDefaultView(document);
    }
    AbstractView.bind(document.defaultView);
    if (document != window.document) {
      new DOMContentLoadedEvent(document);
    }
    return this.base(document);
  },

  "@Gecko": {
    bind: _gecko_bind
  }
});
