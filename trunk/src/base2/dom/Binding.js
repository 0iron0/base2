
var Binding = Interface.extend(null, {
  bind: function(object) {
    // Add methods
    return extend(object, this.prototype);
  }
});
