
var ExtendedMouse = Behavior.extend(null, {
  handleMouseEvent: function(element, event) {
    if (this["on" + event.type]) {
      this["on" + event.type](element, event, event.button, event[_EVENT_X], event[_EVENT_Y], event.screenX, event.screenY);
    }
  }
});
