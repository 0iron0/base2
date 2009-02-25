
// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  bind: function(document) {
    DocumentState.createStateattachments,
        (document);
    return this.base(document);
  }
});
