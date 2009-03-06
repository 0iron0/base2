
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

  var EventDispatcher = Base.extend({
    constructor: function(state) {
      this.state = state;
      this.events = state.events;
    },

    dispatch: function(nodes, event, phase, map) {
      _currentEvent = event;
      event.eventPhase = phase;
      var i = nodes.length;
      while (i-- && !event.cancelBubble) {
        _currentTarget = nodes[i];
        var listeners = map[_currentTarget.nodeType == 1 ? _currentTarget.uniqueID : _currentTarget.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.currentTarget = _currentTarget;
          event.eventPhase = _currentTarget == event.target ? _AT_TARGET : phase;
          for (var listenerID in listeners) {
            _currentListener = listeners[listenerID];
            _fire.base2Events++; // believe it or not, this line of code dispatches the event in its own exection context. ;-)
            if (event.returnValue === false) {
              event.preventDefault();
            }
          }
        }
      }
    },

    handleEvent: function(event, fixed) {
      event = Event.cloneEvent(Event.bind(event));
      var type = event.type,
          w3cType = _W3C_EVENT_TYPE[type];
      if (w3cType) {
        type = event.type = w3cType;
      }
      var typeMap = this.events[type];
      if (typeMap) {
        // Fix the mouse button (left=0, middle=1, right=2)
        if (_MOUSE_BUTTON.test(type)) {
          var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
          event.button = _TYPE_MAP[button] || 0;
        }
        // Collect nodes in the event hierarchy
        var target = event.target, nodes = [], i = 0;
        while (target) {
          nodes[i++] = target;
          target = target.parentNode;
        }
        // Dispatch.
        var map = typeMap[_CAPTURING_PHASE];
        if (map) this.dispatch(nodes, event, _CAPTURING_PHASE, map);
        map = typeMap[_BUBBLING_PHASE];
        if (map && !event.cancelBubble) {
          if (!event.bubbles) nodes.length = 1;
          nodes.reverse();
          this.dispatch(nodes, event, _BUBBLING_PHASE, map);
        }
      }
      return event.returnValue !== false;
    },

    "@MSIE5": {
      dispatch: function(nodes, event, phase, map) {
        // IE5.x documentElement does not have a parentNode so document is missing
        // from the nodes collection
        if (phase == _CAPTURING_PHASE && !Array2.item(nodes, -1).documentElement) {
          nodes.push(nodes[0].document);
        }
        this.base(nodes, event, phase, map);
      }
    }
  });
}
