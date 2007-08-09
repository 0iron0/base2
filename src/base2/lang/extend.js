
function extend(object, source) { // or extend(object, key, value)
  var extend = arguments.callee;
  if (object != null) {
    if (arguments.length > 2) { // Extending with a key/value pair.
      var key = String(source);
      var value = arguments[2];
      // Object detection.
      if (key.charAt(0) == "@") {
        return detect(key.slice(1)) ? extend(object, value) : object;
      }
      // Protect certain objects.
      if (object.extend == extend && /^(base|extend)$/.test(key)) {
        return object;
      }
      // Check for method overriding.
      var ancestor = object[key];
      if (ancestor && instanceOf(value, Function)) {
        if (value != ancestor && !_ancestorOf(value, ancestor)) {
          if (value._base || _BASE.test(value)) {
            // Override the existing method.
            var method = value;
            function _base() {
              var previous = this.base;
              this.base = ancestor;
              var returnValue = method.apply(this, arguments);
              this.base = previous;
              return returnValue;
            };
            value = _base;
            value.method = method;
            value.ancestor = ancestor;
          }
          object[key] = value;
        }
      } else {
        object[key] = value;
      }
    } else if (source) { // Extending with an object literal.
      var Type = instanceOf(source, Function) ? Function : Object;
      if (base2.__prototyping) {
        // Add constructor, toString etc if we are prototyping.
        forEach (_HIDDEN, function(key) {
          if (source[key] != Type.prototype[key]) {
            extend(object, key, source[key]);
          }
        });
      } else {
        // Does the target object have a custom extend() method?
        if (typeof object.extend == "function" && typeof object != "function" && object.extend != extend) {
          extend = unbind(object.extend);
        }
      }
      // Copy each of the source object's properties to the target object.
      _Function_forEach (Type, source, function(value, key) {
        extend(object, key, value);
      });
    }
  }
  return object;
};

function _ancestorOf(ancestor, fn) {
  // Check if a function is in another function's inheritance chain.
  while (fn && fn.ancestor != ancestor) fn = fn.ancestor;
  return !!fn;
};
