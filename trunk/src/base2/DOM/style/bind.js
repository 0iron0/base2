
extend(Document, {
	"@!(document.defaultView)": {
		bind: function(document) {
			this.base(document);
			document.defaultView = Traversal.getDefaultView(document);
			return document;
		}
	}
});
