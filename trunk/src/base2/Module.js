
var Module = Abstract.extend(null, {
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    // Inherit class methods.
    forEach (this, function(method, name) {
      if (!Module[name] && instanceOf(method, Function) && !_PRIVATE.test(name)) {
        extend(module, name, method);
      }
    });
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);
    // Make the submarine noises Larry!
    module.init();
    return module;
  },
  
  implement: function(_interface) {
    // Implement an interface on BOTH the instance and static interfaces.
    var module = this;
    if (typeof _interface == "function") {
      module.base(_interface);
      // If we are implementing another Module then add its static methods.
      if (Module.ancestorOf(_interface)) {
        forEach (_interface, function(method, name) {
          if (!Module[name] && instanceOf(method, Function) && !_PRIVATE.test(name)) {
            extend(module, name, method);
          }
        });
      }
    } else {
      // Create the instance interface.
      _Function_forEach (Object, _interface, function(source, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            forEach (source, arguments.callee);
          }
        } else if (!Module[name] && instanceOf(source, Function)) {
          function _module() { // Late binding.
            return module[name].apply(module, [this].concat(slice(arguments)));
          };
          _module._module = module;
          _module._base = _BASE.test(source);
          extend(module.prototype, name, _module);
        }
      });
      // Add the static interface.
      extend(module, _interface);
    }
    return module;
  }
});
