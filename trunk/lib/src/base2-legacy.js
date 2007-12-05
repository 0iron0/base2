
// This file is required if you wish to support any of the following browsers:
//  * IE5.0 (Windows)
//  * IE5.x (Mac)
//  * Safari 1.x

window.undefined = window.undefined;

new function() {
  var slice = Array.prototype.slice;
  
  $Legacy = {
    has: function(object, key) {
      if (object[key] !== undefined) return true;
      key = String(key);
      for (var i in object) if (i == key) return true;
      return false;
    },
  
    instanceOf: function(object, klass) {
      // only works properly with base2 classes
      return object && (klass == Object || object.constructor == klass ||
        (klass.ancestorOf && klass.ancestorOf(object.constructor)));
    }
  };
  
  // Andrea Giammarchi
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.1)
  (function(override) {
    window.setTimeout = override(setTimeout);
    window.setInterval = override(setInterval);
  })(function(base) {
    return function(value, interval) {
      if (typeof value == "function") {
        var args = slice.call(arguments, 2);
        var fn = value;
        value = function(){
          fn.apply(this, args);
        };
      }
      return base(value, interval);
    };
  });
  /*@end @*/
  
  if (typeof encodeURIComponent == "undefined") {
    encodeURIComponent = function(s) {
      return escape(s).replace(/\%(21|7E|27|28|29)/g, unescape).replace(/[@+\/]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    };
    decodeURIComponent = unescape;
  }
    
  if (typeof Error == "undefined") {
    Error = ErrorConstructor();
    Error.prototype.name = "Error";
    Error.prototype.toString = function() {
      return this.message ? this.name + ": " + this.message : this.name;
    };
    TypeError = ErrorConstructor();
    TypeError.prototype = new Error;
    TypeError.prototype.name = "TypeError";
    SyntaxError = ErrorConstructor();
    SyntaxError.prototype = new Error;
    SyntaxError.prototype.name = "SyntaxError";
  }
  
  function ErrorConstructor() {
    return function(message) {
      this.message = message;
    };
  };
  
  function extend(klass, name, method) {
    if (!klass.prototype[name]) {
      klass.prototype[name] = method;
    }
  };
  
  if ("11".slice(-1) != "1") { // for IE5.0
    var _slice = String.prototype.slice;
    String.prototype.slice = function(start, length) {
      if (arguments.length == 1 && start < 0) {
        arguments[0] = this.length + start;
        arguments[1] = -start;
      }
      return _slice.apply(this, arguments);
    };
  }
  
  extend(Array, "pop", function() {
    if (this.length) {
      var i = this[this.length - 1];
      this.length--;
      return i;
    }
    return undefined;
  });
  
  extend(Array, "push", function() {
    for (var i = 0; i < arguments.length; i++) {
      this[this.length] = arguments[i];
    }
    return this.length;
  });
  
  extend(Array, "shift", function() {
    var r = this[0];
    if (this.length) {
      var a = this.slice(1), i = a.length;
      while (i--) this[i] = a[i];
      this.length--;
    }
    return r;
  });
  
  extend(Array, "splice", function(i, c) {
    var r = c ? this.slice(i, i + c) : [];
    var a = this.slice(0, i).concat(slice.apply(arguments, [2])).concat(this.slice(i + c));
    this.length = i = a.length;
    while (i--) this[i] = a[i];
    return r;
  });
  
  extend(Array, "unshift", function() {
    var a = this.concat.call(slice.apply(arguments, [0]), this), i = a.length;
    while (i--) this[i] = a[i];
    return this.length;
  });
  
  var ns = this;
  extend(Function, "apply", function(o, a) {
    if (o === undefined) o = ns;
    else if (o == null) o = window;
    else if (typeof o == "string") o = new String(o);
    else if (typeof o == "number") o = new Number(o);
    else if (typeof o == "boolean") o = new Boolean(o);
    if (arguments.length == 1) a = [];
    else if (a[0] && a[0].writeln) a[0] = a[0].documentElement.document || a[0];
    var $ = "#b2_apply", r;
    o[$] = this;
    switch (a.length) { // unroll for speed
      case 0: r = o[$](); break;
      case 1: r = o[$](a[0]); break;
      case 2: r = o[$](a[0],a[1]); break;
      case 3: r = o[$](a[0],a[1],a[2]); break;
      case 4: r = o[$](a[0],a[1],a[2],a[3]); break;
      case 5: r = o[$](a[0],a[1],a[2],a[3],a[4]); break;
      default:
        var b = [], i = a.length - 1;
        do b[i] = "a[" + i + "]"; while (i--);
        eval("r=o[$](" + b + ")");
    }
    if (o.valueOf) { // not a COM object
      delete o[$];
    } else {
      o[$] = undefined;
    }
    if (r && r.writeln) r = r.documentElement.document || r;
    return r;
  });
  
  extend(Function, "call", function(o) {
    return this.apply(o, slice.apply(arguments, [1]));
  });
  
  extend(Number, "toFixed", function(n) {
    // Andrea Giammarchi
    n = parseInt(n);
    var	value = Math.pow(10, n);
    value = String(Math.round(this * value) / value);
    if (n > 0) {
      value = value.split(".");
      if (!value[1]) value[1] = "";
      value[1] += Array(n - value[1].length + 1).join(0);
      value = value.join(".");
    };
    return value;
  });
  
  // Fix String.replace (Safari1.x/IE5.0).
  if ("".replace(/^/, String)) {
    var GLOBAL = /(g|gi)$/;
    var RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;
    var _replace = String.prototype.replace; 
    String.prototype.replace = function(expression, replacement) {
      if (typeof replacement == "function") { // Safari doesn't like functions
        if (expression && expression.constructor == RegExp) {
          var regexp = expression;
          var global = regexp.global;
          if (global == null) global = GLOBAL.test(regexp);
          // we have to convert global RexpExps for exec() to work consistently
          if (global) regexp = new RegExp(regexp.source); // non-global
        } else {
          regexp = new RegExp(String(expression).replace(RESCAPE, "\\$1"));
        }
        var match, string = this, result = "";
        while (string && (match = regexp.exec(string))) {
          result += string.slice(0, match.index) + replacement.apply(this, match);
          string = string.slice(match.index + match[0].length);
          if (!global) break;
        }
        return result + string;
      }
      return _replace.apply(this, arguments);
    };
  }
};
