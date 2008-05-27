
var EventDispatcher = Base.extend({
  constructor: function(state) {
    this.state = state;
    this.events = state.events;
  },

  dispatch: function(nodes, event, phase) {
    event.eventPhase = phase;
    var map = this.events[event.type][phase];
    if (map) {
      var i = nodes.length;
      while (i--) {
        var target = nodes[i];
        var listeners = map[target.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.eventPhase = target == event.target ? _AT_TARGET : phase;
          event.currentTarget = target;
          for (var listenerID in listeners) {
            var listener = listeners[listenerID];
            if (typeof listener == "function") {
              listener.call(target, event);
            } else {
              listener.handleEvent(event);
            }
          }
        }
      }
    }
  },

  handleEvent: function(event, fixed) {
    if (!fixed && event.type == "scroll") {
      // horrible IE bug with scroll events
      // the scroll event can't be cancelled so it's not a problem to use a timer
      setTimeout(bind(arguments.callee, this, extend({}, event), true), 0);
      return true;
    }
    Event.bind(event);
    var type = event.type;
    var w3cType = _W3C_EVENT_TYPE[type];
    if (w3cType) {
      event = extend({}, event);
      type = event.type = w3cType;
    }
    if (this.events[type]) {
      // Fix the mouse button (left=0, middle=1, right=2)
      if (_MOUSE_BUTTON.test(type)) {
        var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
        if (button != 2) button = button == 4 ? 1 : 0;
        if (event.button != button) {
          event = extend({}, event);
          event.button = button;
        }
      }
      // Collect nodes in the event hierarchy
      var target = event.target;
      var nodes = [], i = 0;
      while (target) {
        nodes[i++] = target;
        target = target.parentNode;
      }
      this.dispatch(nodes, event, _CAPTURING_PHASE);
      if (!event.bubbles) nodes.length = 1;
      nodes.reverse();
      this.dispatch(nodes, event, _BUBBLING_PHASE);
    }
    return event.returnValue;
  }
});
