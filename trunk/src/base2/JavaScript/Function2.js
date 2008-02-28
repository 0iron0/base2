
var Function2 = _createObject2(
  Function,
  Function,
  "", {
    I: I,
    II: II,
    K: K,
    bind: bind,
    compose: compose,
    delegate: delegate,
    flip: flip,
    not: not,
    partial: partial,
    unbind: unbind,
    unshift: unshift
  }
);

Function2.apply = function(fn, context, args) {
  return fn.apply(context, args);
};
Function2.call  = function(fn, context) {
  return fn.apply(context, _slice.call(arguments, 2));
};

Function2.namespace += "var apply=base2.JavaScript.Function2.apply,call=base2.JavaScript.Function2.call;";

function I(i) { // return first argument
  return i;
};

function II(i, ii) { // return second argument
  return ii;
};

function K(k) {
  return function() {
    return k;
  };
};

function bind(fn, context) {
  var args = _slice.call(arguments, 2);
  var lateBound = typeof fn != "function";
  return args.length == 0 ? function() { // faster if there are no additional arguments
    return (lateBound ? context[fn] : fn).apply(context, arguments);
  } : function() {
    return (lateBound ? context[fn] : fn).apply(context, args.concat.apply(args, arguments));
  };
};

function compose() {
  var fns = _slice.call(arguments);
  return function() {
    var i = fns.length, result = fns[--i].apply(this, arguments);
    while (i--) result = fns[i].call(this, result);
    return result;
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

function partial(fn) { // "hard" partial
  // based on Oliver Steele's version
  var args = _slice.call(arguments, 1);
  return function() {
    var specialised = args.concat(), i = 0, j = 0;
    while (i < args.length && j < arguments.length) {
      if (specialised[i] === undefined) specialised[i] = arguments[j++];
      i++;
    }
    while (j < arguments.length) {
      specialised[i++] = arguments[j++];
    }
    if (Array2.contains(specialised, undefined)) {
      specialised.unshift(fn);
      return partial.apply(null, specialised);
    }
    return fn.apply(this, specialised);
  };
};

function unbind(fn) {
  return function(context) {
    return fn.apply(context, _slice.call(arguments, 1));
  };
};

function unshift(fn) { // "soft" partial
  var args = _slice.call(arguments, 1);
  return function() {
    return fn.apply(this, args.concat.apply(args, arguments));
  };
};

/*
function EQ(v) {
  return function(value) {
    return v === value;
  };
};

function reverse(fn) {
  var length = fn.length;
  return function() {
    // reverse named arguments..
    var args = _slice.call(arguments, 0, length).reverse();
    // ..don't reverse the remaining arguments
    if (arguments.length > length) args = args.concat(_slice.call(arguments, length));
    return fn.apply(this, args);
  };
};

function shift(fn) {
  return function() {
    fn.apply(this, _slice.call(arguments, 1));
  };
};

function slice(fn) {
  var args = _slice.call(arguments, 1);
  return function() {
    fn.apply(this, _slice.apply(arguments, args));
  };
},

function swap(fn, arg1, arg2) {
  return function() {
    return fn.apply(this, Array2.swap(arguments, arg1, arg2));
  };
};
*/
