
function I(i) {
    return i;
};

function K(k) {
  return function() {
    return k;
  };
};

var returns = K; // alias of K

function bind(fn, context) {
  var args = slice(arguments, 2);
  var bound = function() {
    return fn.apply(context, args.concat(slice(arguments)));
  };
  bound._cloneID = assignID(fn);
  return bound;
};

function delegate(fn, context) {
  return function() {
    //Array2.unshift(arguments, this);
    //return fn.apply(context, arguments);
    return fn.apply(context, [this].concat(slice(arguments)));
  };
};

function flip(fn) {
  return function() {
    return fn.apply(this, Array2.swap(arguments, 0, 1));
  };
};

function not(fn) {
  return function() {
    return !fn.apply(this, arguments);
  };
};

function partial(fn) {
  var args = slice.call(arguments, 1);
  return function() {
      return fn.apply(this, args.concat(slice(arguments)));
  };
};

function unbind(fn) {
  return function(context) {
    return fn.apply(context, slice(arguments, 1));
  };
};
