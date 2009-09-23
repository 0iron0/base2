
// release capture

EventTarget.addEventListener(window, "blur", function(event) {
  var element = _state.captureElement;
  if (element && document.body == _state._lastFocusElement) {
    behavior.releaseCapture();
    if (behavior.matchesSelector(element, ":hover")) {
      behavior.dispatchEvent(element, "mouseout");
    }
  }
}, false);

behavior.addClass(document.documentElement, "jsb-enabled");
