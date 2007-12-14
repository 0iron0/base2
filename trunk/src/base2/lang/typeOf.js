
// http://wiki.ecmascript.org/doku.php?id=proposals:typeof

function typeOf(object) {
  var type = typeof object;
  switch (type) {
    case "object":
      return object === null ? "null" : typeof object.call == "function" || _MSIE_NATIVE_FUNCTION.test(object) ? "function" : type;
    case "function":
      return typeof object.call == "function" ? type : "object";
    default:
      return type;
  }
};
