
// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  bind: function(document) {
    if (document != global.document) {
      // This is for the dynamic pseudo classes in Selector.js
      _documentState.register(document);
    }
    return this.base(document);
  },
  
  // http://www.whatwg.org/specs/web-apps/current-work/#activeelement  
  "@(document.activeElement===undefined)": {
    bind: function(document) {
      document.activeElement = document == global.document ? _documentState._focus || document.body : document.body;
      EventTarget.addEventListener(document, "focus", function(event) {
        document.activeElement = event.target;
      }, true);
      EventTarget.addEventListener(document, "blur", function(event) {
        document.activeElement = document.body;
      }, true);
      return this.base(document);
    }
  }
});
