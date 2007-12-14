
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = type;
      event.bubbles = bubbles;
      event.cancelable = cancelable;
      event.timeStamp = new Date().valueOf();
    },
    
    "@MSIE": {
      initEvent: function(event, type, bubbles, cancelable) {
        this.base(event, type, bubbles, cancelable);
        event.cancelBubble = !event.bubbles;
      },
      
      preventDefault: function(event) {
        if (event.cancelable !== false) {
          event.returnValue = false;
        }
      },
    
      stopPropagation: function(event) {
        event.cancelBubble = true;
      }
    }
  }
}, {
/*  "@WebKit": {
    bind: function(event) {
      if (event.target && event.target.nodeType == 3) { // TEXT_NODE
        event = copy(event);
        event.target = event.target.parentNode;
      }
      return this.base(event);
    }
  }, */
  
  "@!(document.createEvent)": {
    "@MSIE": {
      bind: function(event) {
        if (!event.timeStamp) {
          event.bubbles = !!_BUBBLES[event.type];
          event.cancelable = !!_CANCELABLE[event.type];
          event.timeStamp = new Date().valueOf();
        }
        if (!event.target) {
          event.target = event.srcElement;
        }
        event.relatedTarget = event[(event.type == "mouseout" ? "to" : "from") + "Element"];
        return this.base(event);
      }
    }
  }
});

if (_MSIE) {
  var _BUBBLES    = "abort,error,select,change,resize,scroll"; // + _CANCELABLE
  var _CANCELABLE = "click,mousedown,mouseup,mouseover,mousemove,mouseout,keydown,keyup,submit,reset";
  _BUBBLES = Array2.combine((_BUBBLES + "," + _CANCELABLE).split(","));
  _CANCELABLE = Array2.combine(_CANCELABLE.split(","));
}
