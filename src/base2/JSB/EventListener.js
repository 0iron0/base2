
var EventListener = Base.extend({
  constructor: function(listener) {
    this.listener = listener;
  },
  
  listener: null,

  add: function(type) {
    addEventListener(document, type, this, _EVENT_CAPTURE.test(type));
  },
  
  handleEvent: function(event) {
    this.listener.handleEvent(event);
  },

  "@MSIE" : {
    handleEvent: function(event) {
      var target = event.target;
      if (_EVENT_MOUSE.test(event.type) && !target.currentStyle.hasLayout) {
        event = extend({}, event);
        event.offsetX -= target.offsetLeft;
        event.offsetY -= target.offsetTop;
      }
      this.listener.handleEvent(event);
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
      this.listener.handleEvent(event);
    }
  }
});
