
// Mostly fixes for event.offsetX/Y

var EventListener = Base.extend({
  constructor: function(delegator) {
    this.delegator = delegator;
  },
  
  delegator: null,

  add: function(target, type) {
    EventTarget.addEventListener(target, type, this, _EVENT_CAPTURE.test(type));
  },

  delegate: function(type) {
    this.add(document, type);
  },
  
  handleEvent: function(event) {
    this.delegator.handleEvent(event);
  },

  "@Opera" : {
    handleEvent: function(event) {
      var target = event.target;
      if (_EVENT_MOUSE.test(event.type)) {
        var originalEvent = event;
        event = copy(originalEvent);
        event.stopPropagation = function() {
          originalEvent.stopPropagation();
        };
        event.preventDefault = function() {
          originalEvent.preventDefault();
        };
        event.offsetX += target.clientLeft;
        event.offsetY += target.clientTop;
      }
      this.delegator.handleEvent(event);
    }
  },

  "@MSIE" : {
    handleEvent: function(event) {
      var target = event.target;
      if (_EVENT_MOUSE.test(event.type)) {
        event = copy(event);
        var hasLayout = target.currentStyle.hasLayout;
        if (hasLayout === false || !target.clientWidth) {
          event.offsetX -= target.offsetLeft;
          event.offsetY -= target.offsetTop;
          if (hasLayout === undefined) {
            event.offsetX -= 2;
            event.offsetY -= 2;
          }
        }
        event.offsetX += target.clientLeft;
        event.offsetY += target.clientTop;
      }
      this.delegator.handleEvent(event);
    }
  },

  "@Gecko" : {
    handleEvent: function(event) {
      if (_EVENT_MOUSE.test(event.type)) {
        var target = event.target;
        if (target.nodeType == 3) {
          target = target.parentNode;
        }
        if (target.getBoundingClientRect) {
          var rect = target.getBoundingClientRect();
        } else {
          var box = document.getBoxObjectFor(target);
          var computedStyle = getComputedStyle(target, null);
          rect = {
            left: box.x - parseInt(computedStyle.borderLeftWidth),
            top: box.y - parseInt(computedStyle.borderTopWidth)
          };
          // for ancient moz browsers
          if (isNaN(rect.left)) {
            rect.left = target.offsetLeft;
            rect.top = target.offsetTop;
          }
        }
        event.offsetX = event.pageX - rect.left;
        event.offsetY = event.pageY - rect.top;
      }
      this.delegator.handleEvent(event);
    }
  }
});
