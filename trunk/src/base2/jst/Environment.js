
var Environment = Base.extend({
  set: function(name, value) {
    // Set a variable by name
    this[name] = value;
  },
  
  unset: function(name) {
    delete this[name];
  }
});
