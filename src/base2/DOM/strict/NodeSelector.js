
NodeSelector.implement({ 
  querySelector: strictNodeSelector,
  querySelectorAll: strictNodeSelector
});

function strictNodeSelector(node, selector) {
  assertArity(arguments);
  assert(Traversal.isDocument(target) || Traversal.isElement(target), "Invalid object.", TypeError);
  return base(this, arguments);
};
