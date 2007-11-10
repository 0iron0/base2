
// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  // http://www.whatwg.org/specs/web-apps/current-work/#activeelement  
  "@(document.activeElement===undefined)": {
    bind: function(document) {
      document.activeElement = null;
      EventTarget.addEventListener(document, "focus", function(event) { //-dean: is onfocus good enough?
        document.activeElement = event.target;
      }, false);
      return this.base(document);
    }
  }
});
