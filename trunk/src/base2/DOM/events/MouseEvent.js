
// NOT CURRENTLY USED

var MouseEvent = UIEvent.extend({
  "@!(document.createEvent)": {
    initMouseEvent: function(event, type, bubbles, cancelable, view, detail, screenX, screenY,
                             clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
      this.initUIEvent(event, type, bubbles, cancelable, view, detail);
      event.screenX = screenX;
      event.screenY = screenY;
      event.clientX = clientX;
      event.clientY = clientY;
      event.ctrlKey = ctrlKey;
      event.altKey = altKey;
      event.shiftKey = shiftKey;
      event.metaKey = metaKey;
      event.button = button;
      event.relatedTarget = relatedTarget;
    },
}, {
  "@!(document.createEvent)": {
    "@MSIE": {
      bind: function(event) {
        event.relatedTarget = event[(event.target == event.fromElement ? "to" : "from") + "Element"];
        return this.base(event);
      }
    }
  }
});
