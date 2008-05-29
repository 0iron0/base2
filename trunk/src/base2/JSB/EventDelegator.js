
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
    var target = event.target;
    // make sure it's an attached element
    if (Behavior._captureMouse && _MOUSE_CAPTURE.test(type)) {
      target = Behavior._captureElement;
    }
    if (target && this.attached[target.base2ID]) {
      behavior.handleEvent(target, event, type);
    }
  }
});
