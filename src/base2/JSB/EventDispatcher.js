
var EventDispatcher = Base.extend({
  constructor: function(behavior, attachments) {
    this.behavior = behavior;
    this.attachments = attachments;
    this.delegated = {};
  },
  
  add: function(target, type) {
    EventTarget.addEventListener(target, type, this, _EVENT_USE_CAPTURE.test(type));
  },

  delegate: function(document, type) {
    var delegated = this.delegated[document.base2ID];
    if (!delegated) {
      delegated = this.delegated[document.base2ID] = {};
    }
    if (!delegated[type]) {
      delegated[type] = true;
      this.add(document, type);
    }
  },

  dispatchEvent: function(behavior, element, event) {
    var type = event.type,
        behavior = this.behavior,
        handler = behavior["on" + type];
    if (!handler) return;
    var args = [element, event];
    if (_EVENT_MOUSE.test(type)) {
      if (type == "mousewheel") {
        args.push(event.wheelDelta);
      } else {
        if (_EVENT_BUTTON.test(type)) {
          if (behavior.extendedMouse) {
            args.push(event.button);
          } else {
            if (!_MOUSE_BUTTON_LEFT.test(event.button)) return;
          }
        }
        if (!_EVENT_OVER_OUT.test(type)) {
          if (element == event.target) {
            var x = event.offsetX,
                y = event.offsetY;
          } else {
            var offset = this.getOffsetXY(element, event.clientX, event.clientY);
            x = offset.x;
            y = offset.y;
          }
          args.push(x, y, event.screenX, event.screenY);
        }
      }
    } else if (_EVENT_TEXT.test(type)) {
      args.push(event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
    }
    handler.apply(behavior, args);
  },

  handleEvent: function(event) {
    var target = event.target;
    
    if (target.nodeType != 1) return; // you can only attach behaviors to elements
    
    var type = event.type,
        isMouseEvent = _EVENT_MOUSE.test(type),
        capture = state._captureElement && isMouseEvent;
        
    // Don't process mouseover/out when using event capture.
    if (capture && _EVENT_OVER_OUT.test(type)) return;

    // Fix offsetX/Y.
    if (isMouseEvent && type != "mousewheel") {
      if (event.offsetX != null) {
        event = Event.cloneEvent(event);
      }
      var offset = this.getOffsetXY(target, event.clientX, event.clientY);
      event.offsetX = offset.x;
      event.offsetY = offset.y;
    }
    
    var attachments = this.attachments,
        cancelBubble = !event.bubbles || capture,
        element = capture ? state._captureElement : target;

    if (!cancelBubble) {
      extend(event, "stopPropagation", function() {
        this.base();
        cancelBubble = true;
      });
    }
    
    // Dispatch events.
    do {
      // make sure it's an attached element
      if (attachments[element.uniqueID]) {
        this.dispatchEvent(attachments.behavior, element, event);
      }
      element = element.parentNode;
    } while (element && !cancelBubble);
  },
  
  // Manage offsetX/Y.
  
  getOffsetXY: function(element, clientX, clientY) {
    if (element.clientLeft == null) {
      var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
      clientX -= parseInt(computedStyle.borderLeftWidth);
      clientY -= parseInt(computedStyle.borderTopWidth);
    } else {
      clientX -= element.clientLeft;
      clientY -= element.clientTop;
    }
    var clientRect = ElementView.getBoundingClientRect(element);
    return {
      x: clientX - clientRect.left,
      y: clientY - clientRect.top
    }
  },
  
  "@(element.getBoundingClientRect&&element.clientLeft===0)": { // slightly faster if these properties are defined
    getOffsetXY: function(element, clientX, clientY) {
      var clientRect = element.getBoundingClientRect();
      return {
        x: clientX - clientRect.left - element.clientLeft,
        y: clientY - clientRect.top - element.clientTop
      }
    }
  }
});
