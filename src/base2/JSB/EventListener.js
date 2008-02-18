
var EventListener = Base.extend({
  constructor: function(behavior, attached) {
    this.behavior = behavior;
    this.attached = attached;
  },

  behavior: null,
  attached: null,
  
  add: function(type) {
    addEventListener(document, type, this, _EVENT_CAPTURE.test(type)); // delegate
  },
  
  fixEvent: function(event, type) {
    // copy an event object so that we can mess with its properties
    return extend(copy(event), {
      type: type,

      stopPropagation: function() {
        event.stopPropagation();
      },

      preventDefault: function() {
        event.preventDefault();
      }
    });
  },
  
  handleEvent: function(event) {
    var type = event.type;
    var fixedType = _EVENT_TYPE_FIX[type]; // non-JSB events mapped to supported JSB events
    // Pass captured events to the MouseCapture object
    if (_EVENT_MOUSE.test(fixedType || type) && MouseCapture._handleEvent) {
      MouseCapture._handleEvent(event);
    } else {
      var element = event.target;
      // make sure it's an attached element
      if (element && this.attached[element.base2ID]) {
        if (fixedType) event = this.fixEvent(event, fixedType);
        this.behavior.handleEvent(element, event, event.type);
      }
    }
  },

  "@Gecko" : {
    fixEvent: function(event, type) {
      event = copy(event);
      event.__defineGetter__("type", K(type));
      event.wheelDelta = (-event.detail * 40) || 0;
      return event;
    },

    handleEvent: function(event) {
      if (_EVENT_MOUSE.test(event.type)) {
        var box = document.getBoxObjectFor(event.target);
        event.offsetX = event.pageX - box.x;
        event.offsetY = event.pageY - box.y;
      }
      this.base(event);
    }
  },

  "@operaxxxxxxxxxxxxxxxxxxxxxxxxxxx" : {
    handleEvent: function(event) {
      var type = event.type;
      if (type == "keydown") {
        extend(event, "preventDefault", function() {
          this.base();
          this.cancelled = true;
        });
        this.keyCode = event.keyCode;
      } if (type == "keypress") {
        if (this.cancelled) {
          event.preventDefault();
          return;
        }
        event = this.fixEvent(event, "keydown");
        event.keyCode = this.keyCode;
      }
      this.base(event);
      this.cancelled = event.cancelled;
    }
  },

  "@MSIE---------------------" : {
    fixEvent: function(event, type) {
      var fixed = this.base(event, type);
      for (var propertyName in event) {
        if (!fixed[propertyName]) {
          fixed[propertyName] = event[propertyName];
        }
      }
      return fixed;
    },
    
    handleEvent: function(event) {
      var type = event.type;
      var element = event.target;
      // if a mousedown event was cancelled then cancel focus by cancelling the
      //  beforedeactivate event.
      if (type == "beforedeactivate" && this.type == "mousedown" && element != this.target) {
        event.returnValue = this.returnValue;
        if (this.returnValue === false) return;
      }
      // quit if not an attached element
      if (!element || !this.attached[element.base2ID]) return;
      if (type != "mousemove") { // ignore mouse moves
        if (_EVENT_MOUSE.test(type)) {
          if (type == "mouseup") {
            this.button = event.button; // IE "forgets" this value
            // fire missing events for dblclick
            if (this.type == "click" && event.timeStamp - this.timeStamp < 300) {
              this.base(this.fixEvent(event, "mousedown"));
              this.base(event);          // "mouseup"
              event = this.fixEvent(event, "click");
            }
          } else if (_EVENT_CLICK.test(type)) {
            // set the mouse button (IE forgets it)
            event = this.fixEvent(event, type);
            event.button = this.button;
          }
          // store the state of the the event
          this.type = event.type;
          this.timeStamp = event.timeStamp;
        }
      }
      this.base(event);
      if (type == "mousedown") {
        // store the state of the the event, the mousedown event may be cancelled (see above)
        this.returnValue = event.returnValue;
        this.target = event.target;
      }
    }
  }
});
