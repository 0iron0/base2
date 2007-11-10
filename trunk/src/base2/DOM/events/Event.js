
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
    $bubbles: "abort,error,select,change,resize,scroll", // + Event.$cancelable
    $cancelable: "click,mousedown,mouseup,mouseover,mousemove,mouseout,keydown,keyup,submit,reset",
    
    init: function() {
      this.$bubbles = Array2.combine((this.$bubbles + "," + this.$cancelable).split(","));
      this.$cancelable = Array2.combine(this.$cancelable.split(","));
    },
    
    "@MSIE": {
      "@Mac": {
        bind: function(event) {
          // Mac IE5 does not allow expando properties on the event object so
          //  we copy the object instead.
          return this.base(extend(copy(event), {
            preventDefault: function() {
              if (this.cancelable !== false) {
                this.returnValue = false;
              }
            }
          }));
        }
      },
      
      "@Windows": {
        bind: function(event) {
          if (!event.timeStamp) {
            event.bubbles = !!this.$bubbles[event.type];
            event.cancelable = !!this.$cancelable[event.type];
            event.timeStamp = new Date().valueOf();
          }
          if (!event.target) {
            event.target = event.srcElement;
            event.relatedTarget = event[(event.type == "mouseout" ? "to" : "from") + "Element"];
          }
          return this.base(event);
        }
      }
    }
  }
});
