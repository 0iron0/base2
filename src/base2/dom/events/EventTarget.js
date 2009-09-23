
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, useCapture) {
      var documentState = DocumentState.getInstance(target);

      // assign a unique id to both objects
      var targetID = assignID(target),
          listenerID = assignID(listener),
      // create a hash table of event types for the target object
          phase = useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE,
          typeMap = documentState.registerEvent(type, target),
          phaseMap = typeMap[phase];
          
      if (!phaseMap) phaseMap = typeMap[phase] = {};
      // create a hash table of event listeners for each object/event pair
      var listeners = phaseMap[targetID];
      if (!listeners) listeners = phaseMap[targetID] = {};
      // store the event listener in the hash table
      listeners[listenerID] = listener;
    },

    dispatchEvent: function(target, event) {
      event.target = target;
      event._userGenerated = true;
      return DocumentState.getInstance(target).handleEvent(event);
    },

    removeEventListener: function(target, type, listener, useCapture) {
      var events = DocumentState.getInstance(target).events;
      // delete the event listener from the hash table
      var typeMap = events[type];
      if (typeMap) {
        var phaseMap = typeMap[useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE];
        if (phaseMap) {
          var listeners = phaseMap[target.nodeType == 1 ? target.uniqueID : target.base2ID];
          if (listeners) delete listeners[listener.base2ID];
        }
      }
    }
  },

  addEventListener: function(target, type, listener, useCapture) {
    var originalListener = listener;
    if (type == "DOMContentLoaded") {
      listener = _wrap(type, originalListener, function(event) {
        event = Event.cloneEvent(event);
        event.type = type;
        event.bubbles = event.cancelable = false;
        EventTarget.removeEventListener(target, type, originalListener, useCapture);
        _handleEvent(this, originalListener, event);
      });
    } else if (type == "mouseenter" || type == "mouseleave") {
      listener = _wrap(type, originalListener, function(event) {
        if (Traversal.includes(this, event.target) && !Traversal.includes(this, event.relatedTarget)) {
          event = copy(event);
          event.target = this;
          event.type = type;
          event.bubbles = event.cancelable = false;
          _handleEvent(this, originalListener, event);
        }
      });
    }
    this.base(target, _wrappedTypes[type] || type, listener, useCapture);
  },

  removeEventListener: function(target, type, listener, useCapture) {
    this.base(target, _wrappedTypes[type] || type, _unwrap(type, listener), useCapture);
  },
  
  "@Gecko": {
    addEventListener: function(target, type, listener, useCapture) {
      if (type == "mousewheel") {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(event) {
          event = Event.cloneEvent(event);
          event.type = type;
          event.wheelDelta = (-event.detail * 40) || 0;
          _handleEvent(this, originalListener, event);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  },

  "@Gecko1\\.[0-3]|Webkit[1-4]": {
    addEventListener: function(target, type, listener, useCapture) {
      if (/^mouse/.test(type)) {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(event) {
          try {
            if (event.target.nodeType == 3) {
              event = Event.cloneEvent(event);
              event.target = event.target.parentNode;
            }
          } catch (x) {
            // sometimes the target is an anonymous node, ignore these
            return;
          }
          _handleEvent(this, originalListener, event);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  },

  // http://unixpapa.com/js/mouse.html
  "@webkit[1-4]|KHTML[34]": {
    addEventListener: function(target, type, listener, useCapture) {
      var originalListener = listener;
      if (_MOUSE_BUTTON.test(type)) {
        listener = _wrap(type, originalListener, function(event) {
          var button = _BUTTON_MAP[event.button] || 0;
          if (event.button != button) {
            event = Event.cloneEvent(event);
            event.button = button;
          }
          _handleEvent(this, originalListener, event);
        });
      } else if (typeof listener == "object") {
        listener = _wrap(type, originalListener, bind("handleEvent", listener));
      }
      this.base(target, type, listener, useCapture);
    }
  },

  // http://unixpapa.com/js/key.html
  "@Linux|Mac|Opera": {
    addEventListener: function(target, type, listener, useCapture) {
      // Some browsers do not fire repeated "keydown" events when a key
      // is held down. They do fire repeated "keypress" events though.
      // Cancelling the "keydown" event does not cancel the repeated
      // "keypress" events. We fix all of this here...
      if (type == "keydown") {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(keydownEvent) {
          var firedCount = 0, cancelled = false;
          extend(keydownEvent, "preventDefault", function() {
            this.base();
            cancelled = true;
          });
          function handleEvent(event) {
            if (cancelled) event.preventDefault();
            if (event == keydownEvent || firedCount > 1) {
              _handleEvent(this, originalListener, keydownEvent);
            }
            firedCount++;
          };
          var onkeyup = function() {
            this.removeEventListener("keypress", handleEvent, true);
            this.removeEventListener("keyup", onkeyup, true);
          };
          handleEvent.call(this, keydownEvent);
          this.addEventListener("keyup", onkeyup, true);
          this.addEventListener("keypress", handleEvent, true);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  }
});

if (detect("Gecko")) { // this needs to be here
  EventTarget.removeEventListener._delegate = "removeEventListener";
  delete EventTarget.prototype.removeEventListener;
}
