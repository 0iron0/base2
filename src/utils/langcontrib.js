function $(id) {
  return document.getElementById(id);
}
//Don't know how to inherit from Error, so use as:
//  throw newError("Error number %1.",1)
function newError(msg/*, format1, ..., format9*/) {
  return new Error(format.apply(null,arguments));
}
function bind(object, fn) {
  return function() {
    return fn.apply(object,arguments);
  }
}