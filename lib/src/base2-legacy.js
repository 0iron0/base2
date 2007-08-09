
// fix JavaScript for IE5.0 (and others)
window.$Legacy = window.$Legacy || {};
window.undefined = window.undefined;

new function() {
  var MSIE = /*@cc_on!@*/false;
  var E = window.Error, slice = Array.prototype.slice;  
  
  if (!document.nodeType) document.nodeType = 9; // IE5.0
  
  $Legacy.exists = function e(o,k) {
    if (o[k] !== undefined) return true;
    for (var i in o) if (i == k) return true;
    return false;
  };
  
  $Legacy.forEach = function(a, b, c) {
    var i, l = a.length;
    for (i = 0; i < l; i++) {
      if (a[i] !== undefined || e(a, i)) b.call(c, a[i], i, a);
    }
  };
  
  $Legacy.instanceOf = function(o, k) {
    // only works properly with base2 objects
    return o && (k == Object || o.constructor == k || (k.ancestorOf && k.ancestorOf(o.constructor)));
  };
  
  if (typeof encodeURIComponent == "undefined") {
    encodeURIComponent = function(s) {
      return escape(s).replace(/\%(21|7E|27|28|29)/g, unescape).replace(/[@+\/]/g, function(c) {
        return "%" + c.charCodeAt(0).toString(16).toUpperCase();
      });
    };
    decodeURIComponent = unescape;
  }
  
  if (!E) Error = function(m) {
    this.name = "Error";
    this.message = m || "Error";
  };
  if (E) Error.prototype = new E;
  if (typeof TypeError == "undefined") {
    TypeError = SyntaxError = Error;
  }
  
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
  
  extend(Array, "push", function() {
    for (var i = 0; i < arguments.length; i++) {
      this[this.length] = arguments[i];
    }
    return this.length;
  });
  
  extend(Array, "pop", function() {
    if (this.length) {
      var i = this[this.length - 1];
      this.length--;
      return i;
    }
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
  
  extend(Array, "unshift", function() {
    var a = A.concat.call(slice.apply(arguments, [0]), this), i = a.length;
    while (i--) this[i] = a[i];
    return this.length;
  });
  
  extend(Array, "splice", function(i, c) {
    var r = c ? this.slice(i, i + c) : [];
    var a = this.slice(0, i).concat(slice.apply(arguments, [2])).concat(this.slice(i + c)), i = a.length;
    this.length = i;
    while (i--) this[i] = a[i];
    return r;
  });
  
  function fix(o) { // fix
    if (o && o.documentElement) {
      o = o.documentElement.document || o;
    }
    return o;
  };
  
  var ns = this; // this is a frig :-(
  extend(Function, "apply", function(o, a) {
    if (o === undefined) o = ns;
    else if (o == null) o = window;
    else if (typeof o == "string") o = new String(o);
    else if (typeof o == "number") o = new Number(o);
    else if (typeof o == "boolean") o = new Boolean(o);
    if (arguments.length == 1) a = [];
    else if (a[0]) a[0] = fix(a[0]); // fix
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
    try {
      delete o[$];
    } catch (e) {
      o[$] = undefined;
    }
    return fix(r); // fix
  });
  
  extend(Function, "call", function(o) {
    return this.apply(o, slice.apply(arguments, [1]));
  });
  
  extend(Number, "toFixed", function(n) {
    var e = Math.pow(10, n);
    var r = String(Math.round(this * e));
    if (r == 0) for (var i = 0; i < n; i++) r += "0";
    return r.slice(0, r.length - n) + "." + r.slice(r.length - n);
  });
};
