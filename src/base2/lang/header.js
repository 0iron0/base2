
var detect = base2.detect;

var slice = Array.slice || (function(slice) {
  return function(array) {
    return slice.apply(array, slice.call(arguments, 1));
  };
})(Array.prototype.slice);

var Undefined = K(), Null = K(null), True = K(true), False = K(false);

// private
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;             // safe regular expressions
var _BASE = /eval/.test(detect) ? /\bbase\s*\(/ : /.*/; // some platforms don't allow decompilation
var _HIDDEN = ["constructor", "toString", "valueOf"];   // only override these when prototyping
var _REGEXP_STRING = String(new RegExp);
var _counter = 1;

_Function_forEach(); // make sure this is initialised

eval(base2.namespace);
