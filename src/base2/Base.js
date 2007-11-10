
// http://dean.edwards.name/weblog/2006/03/base/

var _subclass = function(_instance, _static) {
  // Build the prototype.
  base2.__prototyping = true;
  var _prototype = new this;
  extend(_prototype, _instance);
  delete base2.__prototyping;
  
  // Create the wrapper for the constructor function.
  var _constructor = _prototype.constructor;
  function klass() {
    // Don't call the constructor function when prototyping.
    if (!base2.__prototyping) {
      if (this.constructor == arguments.callee || this.__constructing) {
        // Instantiation.
        this.__constructing = true;
        _constructor.apply(this, arguments);
        delete this.__constructing;
      } else {
        // Cast.
        return extend(arguments[0], _prototype);
      }
    }
    return this;
  };
  _prototype.constructor = klass;
  
  // Build the static interface.
  for (var i in Base) klass[i] = this[i];
  klass.toString = K(String(_constructor));
  klass.ancestor = this;
  klass.base = Undefined;
  klass.init = Undefined;
  extend(klass, _static);
  klass.prototype = _prototype;
  klass.init();
  
  // introspection (removed when packed)
  ;;; klass["#implements"] = [];
  ;;; klass["#implemented_by"] = [];
  
  return klass;
};

var Base = _subclass.call(Object, {
  constructor: function() {
    if (arguments.length > 0) {
      this.extend(arguments[0]);
    }
  },
  
  base: function() {
    // Call this method from any other method to invoke the current method's ancestor (super).
  },
  
  extend: delegate(extend)  
}, Base = {
  ancestorOf: delegate(_ancestorOf),
  
  extend: _subclass,
    
  forEach: delegate(_Function_forEach),
  
  implement: function(source) {
    if (instanceOf(source, Function)) {
      // If we are implementing another classs/module then we can use
      // casting to apply the interface.
      if (Base.ancestorOf(source)) {
        source(this.prototype); // cast
        // introspection (removed when packed)
        ;;; this["#implements"].push(source);
        ;;; source["#implemented_by"].push(this);
      }
    } else {
      // Add the interface using the extend() function.
      extend(this.prototype, source);
    }
    return this;
  }
});
