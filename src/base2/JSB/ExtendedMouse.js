
// The default behavior for JSB is to only handle mouse events for the left
// mouse button.
// This behavior allows any button click. Relevant events get the "button"
// parameter as the first argument after the "event" parameter.

var ExtendedMouse = Behavior.modify({
  handleEvent: function(element, event, type) {
    type = event.type;
    if (_EVENT_BUTTON.test(type)) {
      var handler = this["on" + type];
      if (handler) {
        this[handler](element, event, event.button, event.offsetX, event.offsetY, event.screenX, event.screenY);
      }
    } else {
      this.base(element, event);
    }
  }
});
