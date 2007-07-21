function assertTarget2(target, description) {
	assert(target == window || Traversal.isDocument(target) || Traversal.isElement(target), format("Invalid %1 target.", description), TypeError);
};

EventTarget.implement({
	matchSingle: function(target, selector) {
  	assertArity(arguments);
  	assertTarget2(target, "CSS query");
  	assertType(selector, "string", "Invalid selector argument.");
		return base(this, arguments);
  }
  
	matchAll: function(node, selector) {
  	assertArity(arguments);
  	assertTarget2(target, "CSS query");
  	assertType(selector, "string", "Invalid selector argument.");
		return base(this, arguments);
	}
});