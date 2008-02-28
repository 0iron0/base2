
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
    // Pass captured events to the MouseCapture object
    if (_EVENT_MOUSE.test(type) && MouseCapture._handleEvent) {
      MouseCapture._handleEvent(event);
    } else if (type == "documentready") {
      if (behavior.ondocumentready) {
        forEach (this.attached, bind(behavior.ondocumentready, behavior, event));
      }
    } else {
      var target = event.target;
      // make sure it's an attached element
      if (target && this.attached[target.base2ID]) {
        behavior.handleEvent(target, event, type);
      }
    }
  }
});
