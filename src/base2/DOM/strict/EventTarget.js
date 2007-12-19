
EventTarget.implement({
  addEventListener: _strictEventListener,

  dispatchEvent: function(target, event) {
    assertArity(arguments);
    _assertEventTarget(target);
    assert(event && event.type, "Invalid event object.", TypeError);
    return this.base(target, event);
  },

  removeEventListener: _strictEventListener
});

function _strictEventListener(target, type, listener, capture) {
  assertArity(arguments);
  _assertEventTarget(target);
  assertType(listener.handleEvent || listener, "function", "Invalid event listener.");
  assertType(capture, "boolean", "Invalid capture argument.");
  return this.base(target, type, listener, capture);
};

function _assertEventTarget(target) {
  assert(target == window || Traversal.isDocument(target) || Traversal.isElement(target), "Invalid event target.", TypeError);
};
