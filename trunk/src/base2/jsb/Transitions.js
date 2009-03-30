
var Transitions = Collection.extend({
  add: function(element, propertyName, params) {
    var key = element.uniqueID + "." + propertyName;
    var currentTransition = this.get(key);
    if (currentTransition) {
      currentTransition.setSpeed(currentTransition.duration / (params.duration || 1)); // change gears
      if (currentTransition.compare(params.end, "start")) { // flipped start/end points indicate the reversal of a transition
        currentTransition.flip();
      }
    } else {
      this.put(key, element, propertyName, params);
      if (!this._timer) this.tick();
    }
  },

  tick: function() {
    var now = Date2.now(),
        completed = [];
    forEach (this, function(transition, key) {
      if (!transition.tick(now)) {
        completed.push(key); // remove later
      }
    });
    forEach (completed, this.remove, this);
    if (this.size() > 0) {
      this._timer = setTimeout(bind(this.tick, this), 1); // loop
    } else {
      delete this._timer;
    }
  }
}, {
  Item: Transition,

  create: function(key, element, propertyName, params) {
    return new this.Item(element, propertyName, params);
  }
});
