
var detect = base2.detect;
var slice = Array.slice || function(array) {
  // Slice an array-like object.
  return _slice.apply(array, _slice.call(arguments, 1));
};

var Undefined = K(), Null = K(null), True = K(true), False = K(false);

// private
var _ID = 1;
var _PRIVATE = /^[_$]/; //-dean: get rid of this?
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;           // safe regular expressions
var _BASE = /eval/.test(detect) ? /\bbase\b/ : /./;   // some platforms don't allow decompilation
var _HIDDEN = ["constructor", "toString", "valueOf"]; // only override these when prototyping
var _REGEXP_STRING = String(new RegExp);
var _slice = Array.prototype.slice;
var _Function_forEach = _get_Function_forEach();      // curse you Safari!

eval(base2.namespace);
