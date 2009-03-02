
var element = behavior.extend({
  set: function(element, propertyName, value) {
    this.base(element, propertyName, value, true);
  }
});
