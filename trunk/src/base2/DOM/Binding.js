
var Binding = Interface.extend(null, {
  bind: function(object) {
    return extend(object, this.prototype);
  }
});
