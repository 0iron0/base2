
var Environment = Base.extend({
  set: function(name, value) {
    this[name] = value;
  },
  
  unset: function(name) {
    delete this[name];
  }
});
