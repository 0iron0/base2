
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
      while (i-- && !event.cancelBubble) {
        var currentTarget = nodes[i];
        var listeners = map[currentTarget.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.currentTarget = currentTarget;
          event.eventPhase = currentTarget == event.target ? _AT_TARGET : phase;
          for (var listenerID in listeners) {
            var listener = listeners[listenerID];
            if (typeof listener == "function") {
              listener.call(currentTarget, event);
            } else {
              listener.handleEvent(event);
            }
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
      event = copy(event);
      type = event.type = w3cType;
    }
    if (this.events[type]) {
      // Fix the mouse button (left=0, middle=1, right=2)
      if (_MOUSE_BUTTON.test(type)) {
        var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
        if (button != 2) button = button == 4 ? 1 : 0;
        if (event.button != button) {
          event = copy(event);
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
    return event.returnValue;
  },

  "@MSIE.+win": {
    handleEvent: function(event) {
      if (event.type == "scroll") {
        // horrible IE bug (setting style during scroll event causes crash)
        // the scroll event can't be cancelled so it's not a problem to use a timer
        setTimeout(bind(this.base, this, copy(event), true), 0);
      } else {
        return this.base(event);
      }
    },
    
    "@MSIE5": {
      dispatch: function(nodes, event, phase) {
        // IE5.0 documentElement does not have a parentNode so document is missing
        // from the nodes collection
        if (phase == _CAPTURING_PHASE && !Array2.item(nodes, -1).documentElement) {
          nodes.push(nodes[0].document);
        }
        this.base(nodes, event, phase);
      }
    }
  }
});
