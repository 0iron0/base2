
var _namespace = "function base(o,a){return o.base.apply(o,a)};";
eval(_namespace);

var detect = base2.detect;

var Undefined = K(), Null = K(null), True = K(true), False = K(false);

// private
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;             // safe regular expressions
var _BASE = /eval/.test(detect) ? /\bbase\s*\(/ : /.*/; // some platforms don't allow decompilation
var _HIDDEN = ["constructor", "toString", "valueOf"];   // only override these when prototyping
var _MSIE_NATIVE_FUNCTION = detect("(jscript)") ?
  new RegExp("^" + rescape(isNaN).replace(/isNaN/, "\\w+") + "$") : {test: False};

var _counter = 1;
var _slice = Array.prototype.slice;

var slice = Array.slice || function(array) {
  return _slice.apply(array, _slice.call(arguments, 1));
};

_Function_forEach(); // make sure this is initialised
