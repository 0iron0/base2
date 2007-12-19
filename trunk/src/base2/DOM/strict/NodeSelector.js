
NodeSelector.implement({ 
  querySelector:    _strictNodeSelector,
  querySelectorAll: _strictNodeSelector
});

function _strictNodeSelector(node, selector) {
  assertArity(arguments);
  assert(Traversal.isDocument(node) || Traversal.isElement(node), "Invalid object.", TypeError);
  return this.base(node, selector);
};
