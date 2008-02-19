
function copy(object) {
  // Doug Crockford
  var fn = function(){};
  fn.prototype = object;
  return new fn;
};
