
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, useCapture) {
      var documentState = DocumentState.getInstance(target);

      // assign a unique id to both objects
      var targetID = assignID(target);
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
      return DocumentState.getInstance(target).handleEvent(event);
    },
    
    removeEventListener: function(target, type, listener, useCapture) {
      var events = DocumentState.getInstance(target).events;
      // delete the event listener from the hash table
      var typeMap = events[type];
      if (typeMap) {
        var phaseMap = typeMap[useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE];
        if (phaseMap) {
          var listeners = phaseMap[target.base2ID];
          if (listeners) delete listeners[listener.base2ID];
        }
      }
    },

    "@(element.fireEvent)": {
      dispatchEvent: function(target, event) {
        event.target = target;
        return this.base(target, event);
      }
    }
  },

  "@Gecko": {
    addEventListener: function(target, type, listener, useCapture) {
      if (type == "mousewheel") {
        // this event cannot be removed
        var onmousewheel = DocumentState[assignID(listener)] = listener;
        listener = function(event) {
          event = copy(event);
          event.__defineGetter__("type", K("mousewheel"));
          event.wheelDelta = (-event.detail * 40) || 0;
          if (typeof onmousewheel == "function") {
            onmousewheel.call(event.target, event);
          } else {
            onmousewheel.handleEvent(event);
          }
        };
        type = "DOMMouseScroll";
      }
      this.base(target, type, listener, useCapture);
    }
  },

  // http://unixpapa.com/js/key.html
  "@Linux|Mac|opera": {
    addEventListener: function(target, type, listener, useCapture) {
      // Some browsers do not fire repeated "keydown" events when a key
      // is held down. They do fire repeated "keypress" events though.
      // Cancelling the "keydown" event does not cancel the repeated
      // "keypress" events. We fix all of this here...
      if (type == "keydown") {
        var onkeydown = DocumentState[assignID(listener)] = listener;
        listener = function(keydown) {
          var firedCount = 0, cancelled = false;
          extend(keydown, "preventDefault", function() {
            this.base();
            cancelled = true;
          });
          function handleEvent(event) {
            if (cancelled) event.preventDefault();
            if (event == keydown || firedCount > 1) {
              if (typeof onkeydown == "function") {
                onkeydown.call(target, keydown);
              } else {
                onkeydown.handleEvent(keydown);
              }
            }
            firedCount++;
          };
          handleEvent(keydown);
          target.addEventListener("keyup", function() {
            target.removeEventListener("keypress", handleEvent, true);
            target.removeEventListener("keyup", arguments.callee, true);
          }, true);
          target.addEventListener("keypress", handleEvent, true);
        };
      }
      this.base(target, type, listener, useCapture);
    },

    removeEventListener: function(target, type, listener, useCapture) {
      this.base(target, type, DocumentState[listener.base2ID] || listener, useCapture);
    }
  }
});
