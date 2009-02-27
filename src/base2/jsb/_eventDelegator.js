
var _eventDelegator = {
  documents: {},

  addEventListener: function(document, type, attachments) {
    var typeMap = this.documents[document.base2ID];
    if (!typeMap) typeMap = this.documents[document.base2ID] = {};
    if (!typeMap[type]) {
      typeMap[type] = [];
      EventTarget.addEventListener(document, type, this, _EVENT_USE_CAPTURE.test(type));
    }
    typeMap[type].push(attachments);
  },

  handleEvent: function(event) {
    var target = event.target;
    
    if (target.nodeType != 1) return; // you can only attach behaviors to elements
    
    var type = event.type,
        isMouseEvent = _EVENT_MOUSE.test(type),
        capture = state._captureElement && isMouseEvent;
        
    // Don't process mouseover/out when using mouse capture.
    if (capture && _EVENT_OVER_OUT.test(type)) return;

    var documentID = target[_OWNER_DOCUMENT].base2ID,
        typeMap = this.documents[documentID];
        
    if (!typeMap) return;
    
    var map = typeMap[type];
    if (!map || !map.length) return;

    // Fix offsetX/Y.
    if (isMouseEvent && type != "mousewheel") {
      if (event.offsetX != null) {
        event = Event.cloneEvent(event);
      }
      var offset = ElementView.getOffsetXY(target, event.clientX, event.clientY);
      event.offsetX = offset.x;
      event.offsetY = offset.y;
    }
    
    var cancelBubble = !event.bubbles || capture,
        element = capture ? state._captureElement : target;

    if (!cancelBubble) {
      extend(event, "stopPropagation", function() {
        this.base();
        cancelBubble = true;
      });
    }
    
    // Dispatch events.
    do {
      var uniqueID = documentID + element.uniqueID;
      if (allAttachments[uniqueID]) {
        for (var i = 0, attachments; attachments = map[i]; i++) {
          // make sure it's an attached element
          if (attachments[uniqueID]) {
            _dispatchEvent(attachments.behavior, element, event);
          }
        }
      }
      element = element.parentNode;
    } while (element && !cancelBubble);
  }
};
