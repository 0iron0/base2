
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
  CAPTURING_PHASE: _CAPTURING_PHASE,
  AT_TARGET:       _AT_TARGET,
  BUBBLING_PHASE:  _BUBBLING_PHASE,

  cloneEvent: function(event) {
    if (event.isClone) return event;
    var clone = copy(event);
    clone.isClone = true;
    clone.stopPropagation = function() {
      event.stopPropagation();
      this.cancelBubble = true;
    };
    clone.preventDefault = function() {
      event.preventDefault();
      this.returnValue = false;
    };
    return clone;
  },
    
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
