
function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).
  
  assertType(klass, "function", "Invalid 'instanceOf' operand.");
  
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.1)
    if ($Legacy.instanceOf(object, klass)) return true;
  @else @*/
    if (object instanceof klass) return true;
  /*@end @*/

  if (object == null) return false;

  // If the class is a Base class then it would have passed the test above.
  if (_isBaseClass(klass)) return false;

  // Base objects can only be instances of Object.
  if (_isBaseClass(object.constructor)) return klass == Object;
  
  switch (klass) {
    case Array: // This is the only troublesome one.
      return !!(typeof object == "object" && object.join && object.splice);
    case Function:
      return !!(typeof object == "function" && object.call);
    case RegExp:
      return object.constructor.prototype.toString() == _REGEXP_STRING;
    case Date:
      return !!object.getTimezoneOffset;
    case String:
    case Number:  // These are bullet-proof.
    case Boolean:
      return typeof object == typeof klass.prototype.valueOf();
    case Object:
      // Only JavaScript objects allowed.
      // COM objects do not have a constructor.
      return typeof object == "object" && typeof object.constructor == "function";
  }
  return false;
};

function _isBaseClass(klass) {
  return klass == Base || _ancestorOf(Base, klass);
};
