
var EventListener = Base.extend({
  constructor: function(delegator) {
    this.delegator = delegator;
  },
  
  delegator: null,

  add: function(type) {
    EventTarget.addEventListener(document, type, this, _EVENT_CAPTURE.test(type));
  },
  
  handleEvent: function(event) {
    this.delegator.handleEvent(event);
  },

  "@MSIE" : {
    handleEvent: function(event) {
      var target = event.target;
      if (_EVENT_MOUSE.test(event.type) && !target.currentStyle.hasLayout) {
        event = extend({}, event);
        event.offsetX -= target.offsetLeft;
        event.offsetY -= target.offsetTop;
      }
      this.delegator.handleEvent(event);
    }
  },

  "@Gecko" : {
    handleEvent: function(event) {
      if (_EVENT_MOUSE.test(event.type)) {
        var box = document.getBoxObjectFor(event.target);
        event.offsetX = event.pageX - box.x;
        event.offsetY = event.pageY - box.y;
      }
      this.delegator.handleEvent(event);
    }
  }
});
