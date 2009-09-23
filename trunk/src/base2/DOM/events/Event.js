
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = String(type);
      event.bubbles = !!bubbles;
      event.cancelable = !!cancelable;
    },

    preventDefault: function(event) {
      if (event.cancelable !== false) event.returnValue = false;
      if (event.type == "mousedown") { // cancel a mousedown event
        var activeElement = Traversal.getDocument(event.target).activeElement,
            suppress = _private.suppress;
        var onblur = function(event) {
          suppress.focus = true;
          activeElement.focus();
          _private.detachEvent(activeElement, "onblur", onblur, true);
          setTimeout(function() {
            delete suppress.focus;
            delete suppress.blur;
          }, 1);
        };
        suppress.blur = true;
        _private.attachEvent(activeElement, "onblur", onblur);
      }
    },

    stopPropagation: function(event) {
      event.cancelBubble = true;
    },

    "@(element.onbeforedeactivate)": {
      preventDefault: function(event) {
        if (event.cancelable !== false) event.returnValue = false;
        if (event.type == "mousedown") { // cancel a mousedown event
          var body = Traversal.getDocument(event.target).body;
          var onbeforedeactivate = function(event) {
            _private.detachEvent(body, "onbeforedeactivate", onbeforedeactivate, true);
            event.returnValue = false;
          };
          _private.attachEvent(body, "onbeforedeactivate", onbeforedeactivate);
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
    bind: function(event) {
      if (!event.timeStamp) {
        event.bubbles = !_NO_BUBBLE.test(event.type);
        event.cancelable = _CANCELABLE.test(event.type);
        event.timeStamp = new Date().valueOf();
      }
      event.relatedTarget = event[(event.target == event.fromElement ? "to" : "from") + "Element"];
      return this.base(event);
    }
  }
});
