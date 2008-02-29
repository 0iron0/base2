
var Container = Behavior.extend(null, {
  EventDelegator: {
    handleEvent: function(event) {
      this.behavior.handleEvent[event.type](event.target, event, event.type);
    }
  }
});
