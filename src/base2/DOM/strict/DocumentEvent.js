
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent

DocumentEvent.implement({
	createEvent: function(document, type) {
		assertArity(arguments);
		assert(Traversal.isDocument(document), "Invalid object.");
		return base(this, arguments);
	}
});
