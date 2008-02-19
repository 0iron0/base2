
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = type;
      event.bubbles = bubbles;
      event.cancelable = cancelable;
    },
    
    "@MSIE": {
      initEvent: function(event, type, bubbles, cancelable) {
        this.base(event, type, bubbles, cancelable);
        event.cancelBubble = !event.bubbles;
      },

      preventDefault: function(event) {
        if (event.cancelable !== false) {
          switch (event.type) {
            case "mousedown":
              var type = "onbeforedeactivate";
              var document = Traversal.getDocument(event.target);
              document.attachEvent(type, function(event) {
                // Allow a mousedown event to cancel a focus event.
                event.returnValue = false;
                document.detachEvent(type, arguments.callee);
              });
            break;
          }
          event.returnValue = false;
        }
      },
    
      stopPropagation: function(event) {
        event.cancelBubble = true;
      }
    }
  }
}, {
  "@!(document.createEvent)": {
    "@MSIE": {
      bind: function(event) {
        var type = event.type;
        var w3cType = _W3C_EVENT_TYPE[type];
        if (event.bubbles == undefined) {
          event.bubbles = !!_BUBBLES[type];
          event.cancelable = !!_CANCELABLE[type];
        }
        var target = event.srcElement;
        if (target) {
          event.target = target;
          if (!event.currentTarget) event.currentTarget = target;
          event.relatedTarget = event[(target == event.fromElement ? "to" : "from") + "Element"]; // should be in MouseEvent.js
          event.eventPhase = event.currentTarget == target ? 2 : _CAPTURE.test(type) ? 1 : 3;
        }
        this.base(event);
        if (w3cType) {
          event = extend({}, event);
          event.type = w3cType;
        } else if (event.target && _MOUSE_BUTTON.test(type)) {
          var button = event.button;
          if (_MOUSE_CLICK.test(type)) {
            var document = Traversal.getDocument(event.target);
            var state = _documentState[document.base2ID];
            if (state) button = state._button;
          }
          if (button != 2) button = button == 4 ? 1 : 0;
          if (event.button != button) {
            event = extend({}, event);
            event.button = button;
          }
        }
        return event;
      }
    }
  }
});

if (_MSIE) {
  var _MOUSE_BUTTON = /^mouse(up|down)|click$/,
      _MOUSE_CLICK  = /click$/,
      _CAPTURE      = /focus(in|out)/,
      _BUBBLES      = "abort,error,select,change,resize,scroll", // + _CANCELABLE
      _CANCELABLE   = "click,mousedown,mouseup,mouseover,mousemove,mouseout,mousewheel,keydown,keyup,submit,reset",

  _CAPTURE_TYPE   = {focus: "focusin", blur: "focusout"},
  _W3C_EVENT_TYPE = {focusin: "focus", focusout: "blur"};
  
  _BUBBLES = Array2.combine(String2.csv(_BUBBLES + "," + _CANCELABLE));
  _CANCELABLE = Array2.combine(String2.csv(_CANCELABLE));
}
