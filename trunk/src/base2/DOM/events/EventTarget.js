
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

var _wrappedListeners = {};

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, useCapture) {
      var documentState = DocumentState.getInstance(target);

      // assign a unique id to both objects
      var targetID = target.nodeType == 1 ? target.uniqueID : assignID(target);
      var listenerID = assignID(listener);

      // create a hash table of event types for the target object
      var phase = useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE;
      var typeMap = documentState.registerEvent(type, target);
      var phaseMap = typeMap[phase];
      if (!phaseMap) phaseMap = typeMap[phase] = {};
      // focus/blur (MSIE)
      if (useCapture) type = _CAPTURE_TYPE[type] || type;
      // create a hash table of event listeners for each object/event pair
      var listeners = phaseMap[targetID];
      if (!listeners) listeners = phaseMap[targetID] = {};
      // store the event listener in the hash table
      listeners[listenerID] = listener;
    },

    dispatchEvent: function(target, event) {
      event.target = target;
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

  "@(element.addEventListener)": {
    "@Gecko": {
      addEventListener: function(target, type, listener, useCapture) {
        if (type == "mousewheel") {
          type = "DOMMouseScroll";
          var originalListener = listener;
          listener = _wrappedListeners[assignID(listener)] = function(event) {
            event = Event.cloneEvent(event);
            event.type = "mousewheel";
            event.wheelDelta = (-event.detail * 40) || 0;
            _handleEvent(target, originalListener, event);
          };
        }
        this.base(target, type, listener, useCapture);
      }
    },

    // http://unixpapa.com/js/mouse.html
    "@webkit[1-4]|KHTML[34]": {
      addEventListener: function(target, type, listener, useCapture) {
        if (_MOUSE_BUTTON.test(type)) {
          var originalListener = listener;
          listener = _wrappedListeners[assignID(listener)] = function(event) {
            var button = _TYPE_MAP[event.button] || 0;
            if (event.button != button) {
              event = Event.cloneEvent(event);
              event.button = button;
            }
            _handleEvent(target, originalListener, event);
          };
        } else if (typeof listener == "object") {
          listener = _wrappedListeners[assignID(listener)] = bind("handleEvent", listener);
        }
        this.base(target, type, listener, useCapture);
      }
    },

    "@KHTML": {
      addEventListener: function(target, type, listener, useCapture) {
        if (type == "mousewheel") {
          var originalListener = listener;
          listener = _wrappedListeners[assignID(listener)] = function(event) {
            event = Event.cloneEvent(event);
            event.wheelDelta /= _DELTA_SCALE;
            _handleEvent(target, originalListener, event);
          };
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
          listener = _wrappedListeners[assignID(listener)] = function(keydownEvent) {
            var firedCount = 0, cancelled = false;
            extend(keydownEvent, "preventDefault", function() {
              this.base();
              cancelled = true;
            });
            function handleEvent(event) {
              if (cancelled) event.preventDefault();
              if (event == keydownEvent || firedCount > 1) {
                _handleEvent(target, originalListener, keydownEvent);
              }
              firedCount++;
            };
            handleEvent(keydownEvent);
            target.addEventListener("keyup", function() {
              target.removeEventListener("keypress", handleEvent, true);
              target.removeEventListener("keyup", arguments.callee, true);
            }, true);
            target.addEventListener("keypress", handleEvent, true);
          };
        }
        this.base(target, type, listener, useCapture);
      }
    },

    removeEventListener: function(target, type, listener, useCapture) {
      this.base(target, type, _wrappedListeners[listener.base2ID] || listener, useCapture);
    }
  }
});

if (detect("Gecko")) { // this needs to be here
  EventTarget.removeEventListener._delegate = "removeEventListener";
  delete EventTarget.prototype.removeEventListener;
}

function _handleEvent(target, listener, event) {
  if (typeof listener == "function") {
    listener.call(target, event);
  } else {
    listener.handleEvent(event);
  }
};
