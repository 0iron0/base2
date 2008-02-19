
// Capture mouse events.

var MouseCapture = Behavior.extend(null, {
  setCapture: function(element) {
    if (!MouseCapture._handleEvent) {
      var behavior = this;
      MouseCapture._captureElement = element;
      MouseCapture._handleEvent = function(event) {
        if (event.currentTarget == element) {
          if (_OPERA) getSelection().collapse(document.body, 0); // prevent text selection
          if (_MSIE) event.eventPhase = 1; // CAPTURING_PHASE
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
      if (MouseCapture._handleEvent) {
        if (!element) element = MouseCapture._captureElement;
        setTimeout(function() {
          element.releaseCapture();
        }, 0);
        this.base(element);
      }
    }
  }
});
