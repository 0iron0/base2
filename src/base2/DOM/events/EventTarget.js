
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var _CLICK_EVENT = /click$/;

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, capture) {
      // assign a unique id to both objects
      var targetID = assignID(target);
      var listenerID = assignID(listener);
      // create a hash table of event types for the target object
      var events = _eventMap[targetID];
      if (!events) events = _eventMap[targetID] = {};
      // capture for focus/blur
      if (capture) type = _CAPTURE_TYPE[type] || type;
      // create a hash table of event listeners for each object/event pair
      var listeners = events[type];
      var current = target["on" + type];
      if (!listeners) {
        listeners = events[type] = {};
        // store the existing event listener (if there is one)
        if (current) listeners[0] = current;
      }
      // store the event listener in the hash table
      listeners[listenerID] = listener;
      if (current !== undefined) {
        target["on" + type] = _eventMap._handleEvent;
      }
    },

    dispatchEvent: function(target, event) {
      return _handleEvent.call(target, event);
    },

    removeEventListener: function(target, type, listener, capture) {
      // delete the event listener from the hash table
      var events = _eventMap[target.base2ID];
      if (events && events[type]) {
        delete events[type][listener.base2ID];
      }
    },

    "@(element.fireEvent)": {
      dispatchEvent: function(target, event) {
        var type = "on" + event.type;
        event.target = target;
        event.currentTarget = target;
        if (target[type] === undefined) {
          return this.base(target, event);
        } else {
          return target.fireEvent(type, event);
        }
      }
    }
  },

  // http://unixpapa.com/js/key.html
  "@Linux|Mac|opera": {
    addEventListener: function(target, type, listener, capture) {
      // Some browsers do not fire repeated "keydown" events when a key
      // is held down. It does fire repeated "keypress" events though.
      // Cancelling the "keydown" event does not cancel the repeated
      // "keypress" events. We fix all of this here...
      if (type == "keydown") {
        var onkeydown = _eventMap[assignID(listener)] = listener;
        listener = function(keydown) {
          var firedCount = 0, cancelled = false;
          extend(keydown, "preventDefault", function() {
            this.base();
            cancelled = true;
          });
          function handleEvent(event) {
            if (cancelled) event.preventDefault();
            if (event == keydown || firedCount > 1) {
              _dispatch(target, onkeydown, keydown);
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
      this.base(target, type, listener, capture);
    },

    removeEventListener: function(target, type, listener, capture) {
      this.base(target, type, _eventMap[listener.base2ID] || listener, capture);
    }
  }
});

var _eventMap = new Base({
  _handleEvent: _handleEvent,

  "@MSIE": {
    _handleEvent: function() {
      var target = this;
      var document = target.document || target;
      var window = document.parentWindow;
      if (target.Infinity) target = window; // weird bug
      var event = window.event;
      event.currentTarget = target;
      var srcElement = event.srcElement;
      if (!srcElement) {
        event.target = document;
      } else {
        var state = _documentState[document.base2ID];
        if (state && srcElement == state._click && event.type == "mouseup") {
          srcElement.fireEvent("onmousedown", event);
          state._click = srcElement;
        }
      }
      return _handleEvent.call(target, event);
    }
  }
});

function _handleEvent(event) {
  var returnValue;
  // get a reference to the hash table of event listeners
  var events = _eventMap[this.base2ID];
  if (events) {
    var listeners = events[event.type];
    // execute each event listener
    for (var i in listeners) {
      var result = _dispatch(this, listeners[i], event);
      if (result === false || event.returnValue === false) returnValue = false;
    }
  }
  return returnValue;
};

function _dispatch(target, listener, event) {
  event = Event.bind(event); // fix the event object
  // support the EventListener interface
  if (listener.handleEvent) {
    return listener.handleEvent(event);
  } else {
    return listener.call(target, event);
  }
};
