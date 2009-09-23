
/*@cc_on @*/

var Undefined = K(), Null = K(null), True = K(true), False = K(false), This = function(){return this};

var global = This(), base2 = global.base2;
  
// private
var _IGNORE = K(),
    _FORMAT = /%([1-9])/g,
    _LTRIM = /^\s\s*/,
    _RTRIM = /\s\s*$/,
    _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g,             // safe regular expressions
    _BASE = /try/.test(detect) ? /\bbase\b/ : /.*/,     // some platforms don't allow decompilation
    _HIDDEN = ["constructor", "toString"],              // only override these when prototyping
    _MSIE_NATIVE_FUNCTION = detect("(jscript)") ?
      new RegExp("^" + rescape(isNaN).replace(/isNaN/, "\\w+") + "$") : {test: False},
    _counter = 1,
    _slice = Array.prototype.slice;

_Function_forEach(); // make sure this is initialised

function assignID(object, name) {
  // Assign a unique ID to an object.
  if (!name) name = object.nodeType == 1 ? "uniqueID" : "base2ID";
  if (!object[name]) object[name] = "b2_" + _counter++;
  return object[name];
};
