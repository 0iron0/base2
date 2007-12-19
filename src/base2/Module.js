
var Module = Abstract.extend(null, {
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    // Inherit class methods.
    module.implement(this);
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);
    module.init();
    return module;
  },
  
  implement: function(_interface) {
    var module = this;
    if (typeof _interface == "function") {
      if (!_ancestorOf(module, _interface)) {
        this.base(_interface);
      }
      if (_ancestorOf(Module, _interface)) {
        // Implement static methods.
        forEach (_interface, function(property, name) {
          if (!module[name]) {
            if (typeof property == "function" && property.call && _interface.prototype[name]) {
              property = function() { // Late binding.
                return _interface[name].apply(_interface, arguments);
              };
            }
            module[name] = property;
          }
        });
      }
    } else {
      // Add static interface.
      extend(module, _interface);
      // Add instance interface.
      _Function_forEach (Object, _interface, function(source, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            forEach (source, arguments.callee);
          }
        } else if (typeof source == "function" && source.call) {
          module.prototype[name] = function() { // Late binding.
            var args = _slice.call(arguments);
            args.unshift(this);
            return module[name].apply(module, args);
          };
          ;;; module.prototype[name]._module = module; // introspection
        }
      });
    }
    return module;
  }
});
