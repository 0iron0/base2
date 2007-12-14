
function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).
  
  if (typeof klass != "function") {
    throw new TypeError("Invalid 'instanceOf' operand.");
  }

  if (object == null) return false;
  
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.1)
    if ($Legacy.instanceOf(object, klass)) return true;
  @else @*/
    if (object instanceof klass) return true;
  /*@end @*/

  // If the class is a base2 class then it would have passed the test above.
  if (Base.ancestorOf == klass.ancestorOf) return false;
  
  // COM objects don't have a constructor
  var _constructor = object.constructor;
  if (typeof _constructor != "function") {
    return typeOf(object) == typeof klass.prototype.valueOf();
  }
  
  // base2 objects can only be instances of Object.
  if (Base.ancestorOf == _constructor.ancestorOf) return klass == Object;
  
  switch (klass) {
    case Array: // This is the only troublesome one.
      return !!(typeof object == "object" && object.join && object.splice);
    case Function:
      return typeOf(object) == "function";
    case RegExp:
      return typeof _constructor.$1 == "string";
    case Date:
      return !!object.getTimezoneOffset;
    case String:
    case Number:  // These are bullet-proof.
    case Boolean:
      return typeof object == typeof klass.prototype.valueOf();
    case Object:
      return true;
  }
  
  return false;
};
