
EventTarget.implement({
  addEventListener: strictEventListener,

  dispatchEvent: function(target, event) {
    assertArity(arguments);
    assertEventTarget(target);
    assert(event && event.type, "Invalid event object.", TypeError);
    return this.base(target, event);
  },

  removeEventListener: strictEventListener
});

function strictEventListener(target, type, listener, capture) {
  assertArity(arguments);
  assertEventTarget(target);
  assertType(listener.handleEvent || listener, "function", "Invalid event listener.");
  assertType(capture, "boolean", "Invalid capture argument.");
  return this.base(target, type, listener, capture);
};

function assertEventTarget(target) {
  assert(target == window || Traversal.isDocument(target) || Traversal.isElement(target), "Invalid event target.", TypeError);
};
