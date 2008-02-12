
var MouseCapture = Behavior.extend(null, {
  setCapture: function(element) {
    if (!MouseCapture._capture) {
      var behavior = this;
      MouseCapture._capture = function(event) {
        behavior.handleMouseEvent(element, event);
      };
      MouseCapture._captureElement = element;
      EventTarget.addEventListener(element, "mousemove", MouseCapture._capture, true);
      EventTarget.addEventListener(element, "mouseup", MouseCapture._capture, true);
    }
  },

  releaseCapture: function(element) {
    if (element == MouseCapture._captureElement) {
      EventTarget.removeEventListener(MouseCapture._captureElement, "mousemove", MouseCapture._capture, true);
      EventTarget.removeEventListener(MouseCapture._captureElement, "mouseup", MouseCapture._capture, true);
      delete MouseCapture._capture;
      delete MouseCapture._captureElement;
    }
  },
  
  "@(element.setCapture)": {
    setCapture: function(element) {
      if (!MouseCapture._capture) {
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
