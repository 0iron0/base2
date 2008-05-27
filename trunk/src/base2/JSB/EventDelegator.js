
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
      if (behavior._readyQueue) {
        forEach (behavior._readyQueue, bind(behavior.ondocumentready, behavior));
        delete behavior._readyQueue;
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
