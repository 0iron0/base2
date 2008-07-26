
var EventDelegator = Base.extend({
  constructor: function(behavior, attached) {
    this.behavior = behavior;
    this.attached = attached;
  },

  behavior: null,
  attached: null,
  
  handleEvent: function(event) {
    var type = event.type;
    var behavior = this.behavior;
    if (type == "documentready") {
      if (behavior._documentReadyQueue) {
        forEach (behavior._documentReadyQueue, behavior.ondocumentready, behavior);
        delete behavior._documentReadyQueue;
      }
    } else {
      var capture = Behavior._captureMouse && _MOUSE_CAPTURE.test(type);
      var target = capture ? Behavior._captureElement : event.target;
      var cancelBubble = !event.bubbles || capture;
      if (!cancelBubble) {
        extend(event, "stopPropagation", function() {
          this.base();
          cancelBubble = true;
        });
      }
      do {
        // make sure it's an attached element
        if (this.attached[target.base2ID]) {
          behavior.handleEvent(target, event, type);
        }
        target = target.parentNode;
      } while (target && !cancelBubble);
    }
  }
});
