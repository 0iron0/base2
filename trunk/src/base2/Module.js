
var Module = Abstract.extend(null, {
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    // Inherit class methods.
    _extendModule(module, this);
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);    
    module.init();
    return module;
  },
  
  implement: function(_interface) {
    // Implement an interface on BOTH the instance and static interfaces.
    var module = this;
    if (typeof _interface == "function") {
      module.base(_interface);
      // If we are implementing another Module then add its static methods.
      if (_ancestorOf(Module, _interface)) {
        _extendModule(module, _interface)
      }
    } else {
      // Create the instance interface.
      var proto = {};
      _Function_forEach (Object, _interface, function(source, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            forEach (source, arguments.callee);
          }
        } else if (!Module[name] && typeof source == "function" && source.call) {
          function _moduleMethod() { // Late binding.
            return module[name].apply(module, [this].concat(slice(arguments)));
          };
          ;;; _moduleMethod._module = module; // introspection
          _moduleMethod.__base = _BASE.test(source);
          proto[name] = _moduleMethod; 
        }
      });
      extend(module.prototype, proto);
      // Add the static interface.
      extend(module, _interface);
    }
    return module;
  }
});

function _extendModule(module, _interface) {
  for (var name in _interface) {
    var method = _interface[name];
    if (!Module[name] && typeof method == "function" && method.call) {
      module[name] = method;
    }
  }
};
