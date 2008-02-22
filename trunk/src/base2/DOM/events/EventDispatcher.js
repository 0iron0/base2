
var _CAPTURING_PHASE = 1,
    _AT_TARGET       = 2,
    _BUBBLING_PHASE  = 3;

var _CAPTURE_TYPE = _MSIE ? {focus: "focusin", blur: "focusout"} : {};

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
          if (target == event.target) {
            event.eventPhase = _AT_TARGET;
          }
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

  handleEvent: function(event) {
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
        var button = event.button;
        if (_MOUSE_CLICK.test(type)) {
          button = this.state._button;
        }
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
      nodes.reverse();
      this.dispatch(nodes, event, _BUBBLING_PHASE);
    }
    return event.returnValue;
  }
});
