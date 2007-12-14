
function I(i) {
    return i;
};

function K(k) {
  return function() {
    return k;
  };
};

function bind(fn, context) {
  var args = _slice.call(arguments, 2);
  return function() {
    return fn.apply(context, args.concat(_slice.call(arguments)));
  };
};

function delegate(fn, context) {
  return function() {
    var args = _slice.call(arguments);
    args.unshift(this);
    return fn.apply(context, args);
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
  var args = _slice.call(arguments, 1);
  return function() {
    return fn.apply(context, args.concat(_slice.call(arguments)));
  };
};

function unbind(fn) {
  return function(context) {
    return fn.apply(context, _slice.call(arguments, 1));
  };
};
