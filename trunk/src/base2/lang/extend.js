
function extend(object, source) { // or extend(object, key, value)
  if (object && source) {
    if (arguments.length > 2) { // Extending with a key/value pair.
      var key = source;
      source = {};
      source[key] = arguments[2];
    }
    var proto = (typeof source == "function" ? Function : Object).prototype;
    // Add constructor, toString etc
    var i = _HIDDEN.length, key;
    if (base2.__prototyping) {
      while (key = _HIDDEN[--i]) {
        var value = source[key];
        if (value != proto[key]) {
          if (_BASE.test(value)) {
            _override(object, key, value)
          } else {
            object[key] = value;
          }
        }
      }
    }
    // Copy each of the source object's properties to the target object.
    for (key in source) {
      if (proto[key] === undefined) {
        var value = source[key];
        // Object detection.
        if (key.charAt(0) == "@") {
          if (detect(key.slice(1))) arguments.callee(object, value);
          continue;
        }
        // Check for method overriding.
        var ancestor = object[key];
        if (ancestor && typeof value == "function") {
          if (value != ancestor && (!ancestor.method || !_ancestorOf(value, ancestor))) {
            if (value.__base || _BASE.test(value)) {
              _override(object, key, value);
            } else {
              object[key] = value;
            }
          }
        } else {
          object[key] = value;
        }
      }
    }
  }
  return object;
};

function _ancestorOf(ancestor, fn) {
  // Check if a function is in another function's inheritance chain.
  while (fn) {
    if (!fn.ancestor) return false;
    fn = fn.ancestor;
    if (fn == ancestor) return true;
  }
  return false;
};

function _override(object, name, method) {
  // Override an existing method.
  var ancestor = object[name];
  function _base() {
    var previous = this.base;
    this.base = ancestor;
    var returnValue = method.apply(this, arguments);
    this.base = previous;
    return returnValue;
  };
  _base.ancestor = ancestor;
  _base.method = method;
  _base.toString = function() {
    return String(method);
  };
  object[name] = _base;
};
