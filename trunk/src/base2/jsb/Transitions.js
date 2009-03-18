
var Transitions = Collection.extend({
  add: function(key, behavior, element, propertyName, params) {
    key = element.uniqueID + "." + propertyName;
    if (this.has(key)) {
      this.get(key).modify(params, Date2.now());
    } else {
      this.put(key, behavior, element, propertyName, params);
    }
    this.tick();
  },

  tick: function() {
    var now = Date2.now(),
        deleted = [];
    this.forEach(function(transition, key) {
      if (!transition.tick(now)) {
        deleted.push(key);
      }
    }, this);
    forEach (deleted, bind(this.remove, this));
    if (this.size()) {
      setTimeout(bind(this.tick, this), 1);
    }
  }
}, {
  Item: Transition,

  create: function(key, behavior, element, propertyName, params) {
    return new this.Item(behavior, element, propertyName, params);
  }
});
