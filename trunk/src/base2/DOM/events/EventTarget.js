
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var EventTarget = Interface.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, capture) {
      // assign a unique id to both objects
      var targetID = assignID(target);
      var listenerID = assignID(listener);
      // create a hash table of event types for the target object
      var events = _eventMap[targetID];
      if (!events) events = _eventMap[targetID] = {};
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
        if (target[type] === undefined) {
          return this.base(target, event);
        } else {
          return target.fireEvent(type, event);
        }
      }
    }
  }
});

var _eventMap = new Base({ 
  _handleEvent: _handleEvent,
  
  "@MSIE": {
    _handleEvent: function() {
      var target = this;
      var window = (target.document || target).parentWindow;
      if (target.Infinity) target = window;
      return _handleEvent.call(target, window.event);
    }
  }
});

function _handleEvent(event) {
  var returnValue = true;
  // get a reference to the hash table of event listeners
  var events = _eventMap[this.base2ID];
  if (events) {
    Event.bind(event); // fix the event object
    var listeners = events[event.type];
    // execute each event listener
    for (var i in listeners) {
      var listener = listeners[i];
      // support the EventListener interface
      if (listener.handleEvent) {
        var result = listener.handleEvent(event);
      } else {
        result = listener.call(this, event);
      }
      if (result === false || event.returnValue === false) returnValue = false;
    }
  }
  return returnValue;
};
