
// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  bind: function(document) {
    DocumentState.createState(document);
    return this.base(document);
  }
});
