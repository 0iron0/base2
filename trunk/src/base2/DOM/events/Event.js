
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = String(type);
      event.bubbles = !!bubbles;
      event.cancelable = !!cancelable;
    },

    preventDefault: function(event) {
      if (event.cancelable !== false) {
        event.returnValue = false;
      }
    },

    stopPropagation: function(event) {
      event.cancelBubble = true;
    },
    
    "@MSIE": {
      preventDefault: function(event) {
        this.base(event);
        if (event.type == "mousedown") {
          var type = "onbeforedeactivate";
          var document = Traversal.getDocument(event.target);
          document.attachEvent(type, function(event) {
            // Allow a mousedown event to cancel a focus event.
            event.returnValue = false;
            document.detachEvent(type, arguments.callee);
          });
        }
      }
    }
  }
}, {
  "@!(document.createEvent)": {
    "@MSIE": {
      bind: function(event) {
        var type = event.type;
        if (!event.timeStamp) {
          event.bubbles = _BUBBLES.test(type);
          event.cancelable = _CANCELABLE.test(type);
          event.timeStamp = new Date().valueOf();
        }
        event.relatedTarget = event[(event.target == event.fromElement ? "to" : "from") + "Element"];
        return this.base(event);
      }
    }
  }
});

var _CAPTURE_TYPE = {};
if (_MSIE) {
  var _MOUSE_BUTTON   = /^mouse(up|down)|click$/,
      _MOUSE_CLICK    = /click$/,
      _BUBBLES        = "abort|error|select|change|resize|scroll|", // + _CANCELABLE
      _CANCELABLE     = "(dbl)?click|mouse(down|up|over|move|out|wheel)|key(down|up)|submit|reset";

  var _W3C_EVENT_TYPE = {focusin: "focus", focusout: "blur"};
      _CAPTURE_TYPE   = {focus: "focusin", blur: "focusout"};

  _BUBBLES = new RegExp("^(" +_BUBBLES + _CANCELABLE + ")$");
  _CANCELABLE = new RegExp("^(" + _CANCELABLE + ")$");
}
