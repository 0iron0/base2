
extend(Document, {
	"@!(document.defaultView)": {
		bind: function(document) {
			document.defaultView = Traversal.getDefaultView(document);
			this.base(document);
			return document;
		}
	}
});
