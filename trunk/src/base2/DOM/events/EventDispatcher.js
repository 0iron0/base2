
var EventDispatcher = Base.extend({
  constructor: function(state) {
    this.state = state;
    this.events = state.events;
  },

  dispatch: function(nodes, event, phase) {
    _currentEvent = Event.cloneEvent(event);
    event.eventPhase = phase;
    var map = this.events[event.type][phase];
    if (map) {
      var i = nodes.length;
      while (i-- && !event.cancelBubble) {
        _currentTarget = nodes[i];
        var listeners = map[_currentTarget.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.currentTarget = _currentTarget;
          event.eventPhase = _currentTarget == event.target ? _AT_TARGET : phase;
          for (var listenerID in listeners) {
            _currentListener = listeners[listenerID];
            _fire.base2Events++;
          }
        }
      }
    }
  },

  handleEvent: function(event, fixed) {
    Event.bind(event);
    var type = event.type;
    var w3cType = _W3C_EVENT_TYPE[type];
    if (w3cType) {
      event = Event.cloneEvent(event);
      type = event.type = w3cType;
    }
    if (this.events[type]) {
      // Fix the mouse button (left=0, middle=1, right=2)
      if (_MOUSE_BUTTON.test(type)) {
        var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
        button = _TYPE_MAP[button] || 0;
        if (event.button != button) {
          event = Event.cloneEvent(event);
          event.button = button;
        }
      }
      // Collect nodes in the event hierarchy
      var currentTarget = event.target;
      var nodes = [], i = 0;
      while (currentTarget) {
        nodes[i++] = currentTarget;
        currentTarget = currentTarget.parentNode;
      }
      this.dispatch(nodes, event, _CAPTURING_PHASE);
      if (!event.cancelBubble) {
        if (!event.bubbles) nodes.length = 1;
        nodes.reverse();
        this.dispatch(nodes, event, _BUBBLING_PHASE);
      }
    }
    return event.returnValue !== false;
  },

  "@MSIE.+win": {
    handleEvent: function(event) {
      if (event.type == "scroll") {
        // horrible IE bug (setting style during scroll event causes crash)
        // the scroll event can't be cancelled so it's not a problem to use a timer
        setTimeout(bind(this.base, this, Event.cloneEvent(event), true), 0);
        return true;
      } else {
        return this.base(event);
      }
    },

    "@MSIE5": {
      dispatch: function(nodes, event, phase) {
        // IE5.x documentElement does not have a parentNode so document is missing
        // from the nodes collection
        if (phase == _CAPTURING_PHASE && !Array2.item(nodes, -1).documentElement) {
          nodes.push(nodes[0].document);
        }
        this.base(nodes, event, phase);
      }
    }
  }
});

// this enables a real execution context for each event.
if (_MSIE) {
  var _fire = document.createElement("meta"),
      _currentEvent,
      _currentTarget,
      _currentListener;

  _fire.base2Events = 0;
  _fire.attachEvent("onpropertychange", function(event) {
    if (event.propertyName == "base2Events") {
      if (typeof _currentListener == "function") {
        _currentListener.call(_currentTarget, _currentEvent);
      } else {
        _currentListener.handleEvent(_currentEvent);
      }
    }
  });
  document.getElementsByTagName("head")[0].appendChild(_fire);
}
