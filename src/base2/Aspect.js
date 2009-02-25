
// NOT USED

// A simple implementation of AOP (Aspect Oriented Programming).

// This is not included as the extend() method provides all of this
// functionality and more.

var Aspect = Module.extend({
  after: function(object, name, after) {
    return extend(object, name, function() {
      var result = this.base.apply(this, arguments);
      after.apply(this, arguments);
      return result;
    });
  },
  
  around: function(object, name, before, after) {
    return this.after(this.before(object, name, before), name, after);
  },
  
  before: function(object, name, before) {
    return extend(object, name, function() {
      before.apply(this, arguments);
      return this.base.apply(this, arguments);
    });
  }
});

//Base.implement(Aspect); // all classes are AOP
