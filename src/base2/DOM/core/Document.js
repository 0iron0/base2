
var Document = Node.extend(null, {
	bind: function(document) { //-dean
		this.base(document);
//-		// automatically bind elements that are created using createElement()
//-		extend(document, "createElement", function(tagName) {
//-			return _bind(this.base(tagName));
//-		});
		AbstractView.bind(document.defaultView);
		return document;
	}
});

// provide these as pass-through methods
Document.createDelegate("createElement");
