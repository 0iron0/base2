
var Transitions = Collection.extend({
  constructor: function(transitions) {
    this.base(transitions);
    this.tick = bind(this.tick, this);
  },
  
  add: function(object, propertyName, params) {
    var key = Transition.getKey(object, propertyName, params),
        transition = this.get(key);
    if (transition) {
      if (transition.duration != params.duration) {
        transition.setSpeed(transition.duration / (params.duration || 1)); // change gears
      }
      if (transition.compare(params.end, "start")) { // flipped start/end points indicate the reversal of a transition
        transition.reverse();
      }
    } else {
      transition = this.put(key, object, propertyName, params);
      if (!this._timer) {
        this._timer = setTimeout(this.tick, 4);
      }
    }
    return transition;
  },

  tick: function() {
    this.invoke("tick", Date2.now());

    var complete = this.filter(function(transition) {
      return transition.complete;
    });

    complete.forEach(this.remove, this);

    complete.forEach(function(transition) {
      if (transition.styleElement) {
        behavior.dispatchEvent(transition.styleElement, "transitionend", {
          propertyName: transition.propertyName,
          elapsedTime: transition.elapsedTime / 1000
        });
      }
    });

    delete this._timer;
    if (this.size() > 0) {
      this._timer = setTimeout(this.tick, 4);
    }
  }
}, {
  Item: Transition,

  create: function(key, object, propertyName, params) {
    return new this.Item(object, propertyName, params);
  }
});
