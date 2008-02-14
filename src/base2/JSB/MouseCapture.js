
// Capture mouse events. Currently only "mousemove" and "mouseup".
// Are any other events necessary?

var MouseCapture = Behavior.extend(null, {
  setCapture: function(element) {
    if (!MouseCapture._handleEvent) {
      var behavior = this;
      MouseCapture._handleEvent = function(event) {
        behavior.handleMouseEvent(element, event, event.type);
      };
      MouseCapture._captureElement = element;
      addEventListener(element, "mouseup", MouseCapture._handleEvent, true);
      addEventListener(element, "mousemove", MouseCapture._handleEvent, true);
    }
  },

  releaseCapture: function(element) {
    if (element == MouseCapture._captureElement) {
      removeEventListener(MouseCapture._captureElement, "mousemove", MouseCapture._handleEvent, true);
      removeEventListener(MouseCapture._captureElement, "mouseup", MouseCapture._handleEvent, true);
      delete MouseCapture._captureElement;
      delete MouseCapture._handleEvent;
    }
  },
  
  "@(element.setCapture)": {
    setCapture: function(element) {
      if (!MouseCapture._handleEvent) {
        this.base(element);
        setTimeout(function() {
          element.setCapture();
        }, 0);
      }
    },

    releaseCapture: function(element) {
      if (element == MouseCapture._captureElement) {
        element.releaseCapture();
        this.base(element);
      }
    }
  }
});
