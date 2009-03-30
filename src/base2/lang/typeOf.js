
// http://wiki.ecmascript.org/doku.php?id=proposals:typeof

function typeOf(object) {
  var type = typeof object;
  switch (type) {
    case "object":
      return object == null
        ? "null"
        : typeof object.constructor != "function" // COM object
          ? _MSIE_NATIVE_FUNCTION.test(object)
            ? "function"
            : type
          : _toString.call(object) == "[object Date]"
            ? type
            : typeof object.constructor.prototype.valueOf(); // underlying type
    case "function":
      return typeof object.call == "function" ? type : "object";
    default:
      return type;
  }
};
