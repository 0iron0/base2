
// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
  forEach: function(block, context) {
    forEach (this, function(method, name) {
      if (typeOf(method) == "function" && (this.prototype[name] || method._delegate)) {
        block.call(context, method, name, this);
      }
    }, this, Module);
  },
  
  implement: function(_interface) {
    if (typeof _interface == "object") {
      _extendModule(this, _interface);
    } else if (Interface.ancestorOf(_interface)) {
      for (var name in _interface) {
        if (_interface[name] && _interface[name]._delegate) {
          this[name] = bind(name, _interface);
          this[name]._delegate = name;
        }
      }
    }
    return this.base(_interface);
  }
});

function _extendModule(module, _interface) {
  for (var name in _interface) {
    var property = _interface[name];
    if (name.charAt(0) == "@") {
      _extendModule(module, property);
    } else if (!module[name] && typeof property == "function" && property.call) {
      // delegate a static method to the bound object
      //  e.g. for most browsers:
      //    EventTarget.addEventListener(element, type, listener, capture)
      //  forwards to:
      //    element.addEventListener(type, listener, capture)
      var fn = _createDelegate(name);
      fn._delegate = name;
      module[name] = fn;
      module.namespace += "var " + name + "=base2.JavaScript.Function2.bind('" + name + "',base2.Module[" + module.toString("index") + "]);";
    }
  }
};

var _createDelegate = _MSIE ? function(name) {
  return function _staticModuleMethod(element, a,b,c,d,e,f,g,h,i,j,k,l,m,n,o) {
    element.base = element[name].ancestor;
    var method = element.base ? 'base' : name;
    return element[method](a,b,c,d,e,f,g,h,i,j,k,l,m,n,o);
  };
} : function(name) {
  return function _staticModuleMethod(element) {
    element.base = element[name].ancestor;
    var method = element.base ? 'base' : name;
    return element[method].apply(element, Array2.slice(arguments, 1));
  };
};
