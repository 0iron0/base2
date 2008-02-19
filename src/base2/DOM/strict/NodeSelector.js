
NodeSelector.implement({ 
  querySelector:    strictNodeSelector,
  querySelectorAll: strictNodeSelector
});

function strictNodeSelector(node, selector) {
  assertArity(arguments);
  assert(Traversal.isDocument(node) || Traversal.isElement(node), "Invalid object.", TypeError);
  return this.base(node, selector);
};
