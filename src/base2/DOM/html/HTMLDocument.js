
// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend({
	"@!(document.nodeType)": {
		nodeType: 9
	}
}, {
	// http://www.whatwg.org/specs/web-apps/current-work/#activeelement	
	"@(document.activeElement===undefined)": {
		bind: function(document) {
			this.base(document);
			document.activeElement = null;
			document.addEventListener("focus", function(event) { //-dean: is onfocus good enough?
				document.activeElement = event.target;
			}, false);
			return document;
		}
	}
});
