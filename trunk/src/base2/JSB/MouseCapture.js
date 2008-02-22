
// Capture mouse events.

var _MOUSE_EVENTS = String2.csv("over,out,move,down,up,wheel");

var MouseCapture = Behavior.extend(null, {
  setCapture: function(element) {
    if (!MouseCapture._handleEvent) {
      var behavior = this;
      MouseCapture._captureElement = element;
      MouseCapture._handleEvent = function(event) {
        if (event.currentTarget == element) {
          if (_OPERA) getSelection().collapse(document.body, 0); // prevent text selection
          behavior.handleEvent(element, event, event.type);
        }
      };
      forEach (_MOUSE_EVENTS, function(type) {
        addEventListener(element, "mouse" + type, MouseCapture._handleEvent, true);
      });
    }
  },

  releaseCapture: function(element) {
    if (MouseCapture._handleEvent) {
      if (!element) element = MouseCapture._captureElement;
      forEach (_MOUSE_EVENTS, function(type) {
        removeEventListener(element, "mouse" + type, MouseCapture._handleEvent, true);
      });
      delete MouseCapture._handleEvent;
      delete MouseCapture._captureElement;
    }
  }
});
