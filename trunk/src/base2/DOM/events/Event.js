
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({  
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.timeStamp = new Date().valueOf();
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
          event.returnValue = false;
        }
      },
    
      stopPropagation: function(event) {
        event.cancelBubble = true;
      }
    }
  }
}, {
  BUBBLES: "abort,error,select,change,resize,scroll", // + Event.CANCELABLE
  CANCELABLE: "click,mousedown,mouseup,mouseover,mousemove,mouseout,keydown,keyup,submit,reset",
  
  init: function() {
    this.BUBBLES = Array2.combine((this.BUBBLES + "," + this.CANCELABLE).split(","));
    this.CANCELABLE = Array2.combine(this.CANCELABLE.split(","));
  },
  
  "@MSIE": {
    "@Mac": {
      bind: function(event) {
        // Mac IE5 does not allow expando properties on the event object so
        //  we copy the object instead.
        return this.base(extend({
          preventDefault: function() {
            if (this.cancelable !== false) {
              this.returnValue = false;
            }
          }
        }, event));
      }
    },
    
    "@Windows": {
      bind: function(event) {
        this.base(event);
        if (!event.timeStamp) {
          event.bubbles = !!this.BUBBLES[event.type];
          event.cancelable = !!this.CANCELABLE[event.type];
          event.timeStamp = new Date().valueOf();
        }
        if (!event.target) {
          event.target = event.srcElement;
        }
        event.relatedTarget = event.fromElement || null;
        return event;
      }
    }
  }
});
