
// this enables a real execution context for each event.
if (detect.MSIE && !detect("element.dispatchEvent")) {
  var _fire = document.createElement(/^CSS/.test(document.compatMode) ? "meta" : "marquee"),
      _base2Event = _private.base2Event = {};

  _fire.base2Events = 0;
  _fire.attachEvent("onpropertychange", new Function('e', 'var d=base2.toString.base2Event;\
if (e.propertyName=="base2Events"){\
if(typeof d.listener=="function")d.listener.call(d.target,d.event);\
else d.listener.handleEvent(d.event)}'));
  
  document.getElementsByTagName("head")[0].appendChild(_fire);

  var EventDispatcher = Base.extend({
    constructor: function(state) {
      this.state = state;
    },

    dispatch: function(nodes, event, phase, map) {
      event.eventPhase = phase;
      var i = nodes.length;
      while (i-- && !event.cancelBubble) {
        var target = nodes[i],
            listeners = map[target.nodeType == 1 ? target.uniqueID : target.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.currentTarget = target;
          event.eventPhase = target == event.target ? _AT_TARGET : phase;
          for (var listenerID in listeners) {
            _base2Event.event = event;
            _base2Event.target = target;
            _base2Event.listener = listeners[listenerID];
            _fire.base2Events++; // dispatch the event
            if (event.returnValue === false) {
              event.preventDefault();
            }
          }
        }
      }
    },

    handleEvent: function(event) {
      event = Event.cloneEvent(Event.bind(event));
      var type = event.type;
      if (_EVENT_MAP[type]) {
        type = event.type = _EVENT_MAP[type];
        event.bubbles = !_NO_BUBBLE.test(type);
      }

      var typeMap = this.state.events[type];
      if (typeMap && !_private.suppress[type]) {
        // Fix the mouse button (left=0, middle=1, right=2)
        if (_MOUSE_BUTTON.test(type)) {
          var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
          event.button = _BUTTON_MAP[button] || 0;
        }

        // Collect nodes in the event hierarchy
        var target = event.target, nodes = [], i = 0;
        while (target) {
          nodes[i++] = target;
          target = target.parentNode;
        }
        /*@if (@_jscript_version < 5.6)
        if (nodes[0].nodeType == 1 && !nodes[i - 1].documentElement) {
          nodes[i] = Traversal.getDocument(nodes[0]);
        }
        /*@end @*/

        // Dispatch.
        var map = typeMap[_CAPTURING_PHASE];
        if (map) this.dispatch(nodes, event, _CAPTURING_PHASE, map);
        map = typeMap[_BUBBLING_PHASE];
        if (map && !event.cancelBubble) {
          if (event.bubbles) {
            nodes.reverse();
          } else {
            nodes.length = 1;
          }
          this.dispatch(nodes, event, _BUBBLING_PHASE, map);
        }
      }
      return event.returnValue !== false;
    }
  });
}
