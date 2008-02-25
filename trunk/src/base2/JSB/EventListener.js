
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
    var behavior = this.behavior;
    var fixedType = _EVENT_TYPE_FIX[type]; // non-JSB events mapped to supported JSB events
    // Pass captured events to the MouseCapture object
    if (_EVENT_MOUSE.test(fixedType || type) && MouseCapture._handleEvent) {
      MouseCapture._handleEvent(event);
    } else if (type == "documentready") {
      if (behavior.ondocumentready) {
        forEach (this.attached, bind(behavior.ondocumentready, behavior, event));
      }
    } else {
      var element = event.target;
      // make sure it's an attached element
      if (element && this.attached[element.base2ID]) {
        if (fixedType) event = this.fixEvent(event, fixedType);
        behavior.handleEvent(element, event, event.type);
        _busy = MouseCapture._handleEvent || _EVENT_BUSY.test(event.type);
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
  }
});
