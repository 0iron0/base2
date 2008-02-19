
var _moduleCount = 0;

var Module = Abstract.extend(null, {
  namespace: "",

  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    var index = _moduleCount++;
    module.namespace = "";
    module.partial = this.partial;
    module.toString = function(hint) {
      return hint == "index" ? index : "[module]";
    };
    Module[index] = module;
    // Inherit class methods.
    module.implement(this);
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);
    module.init();
    return module;
  },

  forEach: function(block, context) {
    _Function_forEach (Module, this.prototype, function(method, name) {
      if (typeOf(method) == "function") {
        block.call(context, this[name], name, this);
      }
    }, this);
  },

  implement: function(_interface) {
    var module = this;
    var index = module.toString("index");
    if (typeof _interface == "function") {
      if (!_ancestorOf(_interface, module)) {
        this.base(_interface);
      }
      if (_ancestorOf(Module, _interface)) {
        // Implement static methods.
        _Function_forEach (Module, _interface, function(property, name) {
          if (typeof module[name] == "undefined") {
            if (typeOf(property) == "function" && _interface.prototype[name]) {
              property = function() {
                return _interface[name].apply(this, arguments);
              };
            }
            module[name] = property;
          }
        });
        module.namespace += _interface.namespace.replace(/\b\d+\b/g, index);
      }
    } else {
      // Add static interface.
      extend(module, _interface);
      // Add instance interface.
      var proto = module.prototype;
      _Function_forEach (Object, _interface, function(property, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            _Function_forEach (Object, property, arguments.callee);
          }
        } else if (!proto[name]) {
          if (name == name.toUpperCase()) {
            module.namespace += format("var %1=base2.Module[%2].%1;", name, index);
          } else if (typeOf(property) == "function") {
            module.namespace += format("var %1=base2.JavaScript.Function2.bind('%1',base2.Module[%2]);", name, index);
            proto[name] = function() {
              var args = _slice.call(arguments);
              args.unshift(this);
              return module[name].apply(module, args); // Late binding.
            };
            ;;; proto[name]._module = module; // introspection
          }
        }
      });
    }
    return module;
  },

  partial: function() {
    var module = Module.extend();
    var index = module.toString("index");
    // partial methods are already bound so remove the binding to speed things up
    module.namespace = this.namespace.replace(/(\w+)=b[^\)]+\)/g, "$1=base2.Module[" + index + "].$1");
    this.forEach(function(method, name) {
      module[name] = partial(bind(method, module));
    });
    return module;
  }
});
