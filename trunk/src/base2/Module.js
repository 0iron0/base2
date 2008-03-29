
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
    if (_interface) module.implement(_interface);
    // Implement static properties and methods.
    if (_static) {
      extend(module, _static);
      if (module.init) module.init();
    }
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
        for (var name in _interface) {
          if (module[name] === undefined) {
            var property = _interface[name];
            if (typeof property == "function" && property.call && _interface.prototype[name]) {
              property = _staticModuleMethod(_interface, name);
            }
            module[name] = property;
          }
        }
        module.namespace += _interface.namespace.replace(/\b\d+\b/g, index);
      }
    } else {
      // Add static interface.
      extend(module, _interface);
      // Add instance interface.
      _extendModule(module, _interface, index);
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

function _extendModule(module, _interface, index) {
  var proto = module.prototype;
  for (var name in _interface) {
    var property = _interface[name], namespace = "";
    if (name.charAt(0) == "@") { // object detection
      if (detect(name.slice(1))) _extendModule(module, property, index);
    } else if (!proto[name]) {
      if (name == name.toUpperCase()) {
        namespace = "var " + name + "=base2.Module[" + index + "]." + name + ";";
      } else if (typeof property == "function" && property.call) {
        namespace = "var " + name + "=base2.lang.bind('" + name + "',base2.Module[" + index + "]);";
        proto[name] = _moduleMethod(module, name);
        ;;; proto[name]._module = module; // introspection
      }
      if (module.namespace.indexOf(namespace) == -1) {
        module.namespace += namespace;
      }
    }
  }
};

function _staticModuleMethod(module, name) {
  return function _staticModuleMethod() {
    return module[name].apply(this, arguments);
  };
};

function _moduleMethod(module, name) {
  return function _moduleMethod() {
    var args = _slice.call(arguments);
    args.unshift(this);
    return module[name].apply(this, args);
  };
};
