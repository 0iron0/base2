// timestamp: Fri, 10 Aug 2007 19:40:56
/*
  base2 - copyright 2007, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license
  
  Contributors:
    Doeke Zanstra
*/

var base2 = {
  name:    "base2",
  version: "0.9 (alpha)",
  exports:
    "Base, Namespace, Abstract, Module, Enumerable, Hash, Collection, RegGrp, " +
    "Array2, Date2, String2, " +
    "assert, assertArity, assertType, " +
    "assignID, copy, detect, extend, forEach, format, instanceOf, match, rescape, slice, trim, " +
    "I, K, Undefined, Null, True, False, bind, delegate, flip, not, partial, returns, unbind",
  
  global: this, // the window object in a browser environment
  namespace: "var global=base2.global;function base(o,a){return o.base.apply(o,a)};",
    
  // this is defined here because it must be defined in the global scope
  detect: new function(_) {  
    // Two types of detection:
    //  1. Object detection
    //     e.g. detect("(java)");
    //     e.g. detect("!(document.addEventListener)");
    //  2. Platform detection (browser sniffing)
    //     e.g. detect("MSIE");
    //     e.g. detect("MSIE|opera");
        
    var global = _;
    var jscript/*@cc_on=@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
    var java = _.java;
    
    if (_.navigator) {
      var element = document.createElement("span");
      var platform = navigator.platform + " " + navigator.userAgent;
      // Fix opera's (and others) user agent string.
      if (!jscript) platform = platform.replace(/MSIE\s[\d.]+/, "");
      // Close up the space between name and version number.
      //  e.g. MSIE 6 -> MSIE6
      platform = platform.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
      java = navigator.javaEnabled() && java;
    }
    
    return function(test) {
      var r = false;
      var not = test.charAt(0) == "!";
      if (not) test = test.slice(1);
      test = test.replace(/^([^\(].*)$/, "/($1)/i.test(platform)");
      try {
        eval("r=!!" + test);
      } catch (error) {
        // the test failed
      }
      return !!(not ^ r);
    };
  }(this)
};

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// base2/lang/header.js
// =========================================================================

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

// =========================================================================
// base2/Base.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/03/base/

var _subclass = function(_instance, _static) {
  // Build the prototype.
  base2.__prototyping = true;
  var _prototype = new this;
  extend(_prototype, _instance);
  delete base2.__prototyping;
  
  // Create the wrapper for the constructor function.
  var _constructor = _prototype.constructor;
  function klass() {
    // Don't call the constructor function when prototyping.
    if (!base2.__prototyping) {
      if (this.constructor == arguments.callee || this.__constructing) {
        // Instantiation.
        this.__constructing = true;
        _constructor.apply(this, arguments);
        delete this.__constructing;
      } else {
        // Cast.
        return extend(arguments[0], _prototype);
      }
    }
  };
  _prototype.constructor = klass;
  
  // Build the static interface.
  for (var i in Base) klass[i] = this[i];
  klass.ancestor = this;
  klass.base = Undefined;
  klass.init = Undefined;
  klass.prototype = _prototype;
  extend(klass, _static);
  klass.init();
  
  // reflection (removed when packed)
  ;;; klass["#implements"] = [];
  ;;; klass["#implemented_by"] = [];
  
  return klass;
};

var Base = _subclass.call(Object, {
  constructor: function() {
    if (arguments.length > 0) {
      this.extend(arguments[0]);
    }
  },
  
  base: function() {
    // Call this method from any other method to invoke the current method's ancestor (super).
  },
  
  extend: delegate(extend)  
}, Base = {
  ancestorOf: delegate(_ancestorOf),
  
  extend: _subclass,
    
  forEach: delegate(_Function_forEach),
  
  implement: function(source) {
    if (instanceOf(source, Function)) {
      // If we are implementing another classs/module then we can use
      // casting to apply the interface.
      if (Base.ancestorOf(source)) {
        source(this.prototype); // cast
        // reflection (removed when packed)
        ;;; this["#implements"].push(source);
        ;;; source["#implemented_by"].push(this);
      }
    } else {
      // Add the interface using the extend() function.
      extend(this.prototype, source);
    }
    return this;
  }
});

// =========================================================================
// base2/Namespace.js
// =========================================================================

var Namespace = Base.extend({
  constructor: function(_private, _public) {
    this.extend(_public);
    
    // Initialise.
    if (typeof this.init == "function") this.init();
    
    if (this.name != "base2") {
      base2.addName(this.name, this);
      this.namespace = format("var %1=base2.%1;", this.name);
    }
    
    var LIST = /[^\s,]+/g; // pattern for comma separated list
    
    // This string should be evaluated immediately after creating a Namespace object.
    _private.imports = Array2.reduce(this.imports.match(LIST), function(namespace, name) {
      assert(base2[name], format("Namespace not found: '%1'.", name));
      return namespace += base2[name].namespace;
    }, base2.namespace);
    
    // This string should be evaluated after you have created all of the objects
    // that are being exported.
    _private.exports = Array2.reduce(this.exports.match(LIST), function(namespace, name) {
      this.namespace += format("var %2=%1.%2;", this.name, name);
      return namespace += format("if(!%1.%2)%1.%2=%2;", this.name, name);
    }, "", this);
  },

  exports: "",
  imports: "",
  namespace: "",
  name: "",
  
  addName: function(name, value) {
    this[name] = value;
    this.exports += ", " + name;
    this.namespace += format("var %1=%2.%1;", name, this.name);
  }
});

// =========================================================================
// base2/Abstract.js
// =========================================================================

var Abstract = Base.extend({
  constructor: function() {
    throw new TypeError("Class cannot be instantiated.");
  }
});

// =========================================================================
// base2/Module.js
// =========================================================================

var Module = Abstract.extend(null, {
  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    // Inherit class methods.
    forEach (this, function(method, name) {
      if (!Module[name] && instanceOf(method, Function) && !_PRIVATE.test(name)) {
        extend(module, name, method);
      }
    });
    // Implement module (instance AND static) methods.
    module.implement(_interface);
    // Implement static properties and methods.
    extend(module, _static);
    // Make the submarine noises Larry!
    module.init();
    return module;
  },
  
  implement: function(_interface) {
    // Implement an interface on BOTH the instance and static interfaces.
    var module = this;
    if (typeof _interface == "function") {
      module.base(_interface);
      // If we are implementing another Module then add its static methods.
      if (Module.ancestorOf(_interface)) {
        forEach (_interface, function(method, name) {
          if (!Module[name] && instanceOf(method, Function) && !_PRIVATE.test(name)) {
            extend(module, name, method);
          }
        });
      }
    } else {
      // Create the instance interface.
      _Function_forEach (Object, _interface, function(source, name) {
        if (name.charAt(0) == "@") { // object detection
          if (detect(name.slice(1))) {
            forEach (source, arguments.callee);
          }
        } else if (!Module[name] && instanceOf(source, Function)) {
          function _module() { // Late binding.
            return module[name].apply(module, [this].concat(slice(arguments)));
          };
          _module._module = module;
          _module._base = _BASE.test(source);
          extend(module.prototype, name, _module);
        }
      });
      // Add the static interface.
      extend(module, _interface);
    }
    return module;
  }
});

// =========================================================================
// base2/Enumerable.js
// =========================================================================

var Enumerable = Module.extend({
  every: function(object, test, context) {
    var result = true;
    try {
      this.forEach (object, function(value, key) {
        result = test.call(context, value, key, object);
        if (!result) throw StopIteration;
      });
    } catch (error) {
      if (error != StopIteration) throw error;
    }
    return !!result; // cast to boolean
  },
  
  filter: function(object, test, context) {
    var i = 0;
    return this.reduce(object, function(result, value, key) {
      if (test.call(context, value, key, object)) {
        result[i++] = value;
      }
      return result;
    }, []);
  },
  
  invoke: function(object, method) {
    // Apply a method to each item in the enumerated object.
    var args = slice(arguments, 2);
    return this.map(object, (typeof method == "function") ? function(item) {
      if (item != null) return method.apply(item, args);
    } : function(item) {
      if (item != null) return item[method].apply(item, args);
    });
  },
  
  map: function(object, block, context) {
    var result = [], i = 0;
    this.forEach (object, function(value, key) {
      result[i++] = block.call(context, value, key, object);
    });
    return result;
  },
  
  pluck: function(object, key) {
    return this.map(object, function(item) {
      if (item != null) return item[key];
    });
  },
  
  reduce: function(object, block, result, context) {
    var initialised = arguments.length > 2;
    this.forEach (object, function(value, key) {
      if (initialised) { 
        result = block.call(context, result, value, key, object);
      } else { 
        result = value;
        initialised = true;
      }
    });
    return result;
  },
  
  some: function(object, test, context) {
    return !this.every(object, not(test), context);
  }
}, {
  forEach: forEach
});

// =========================================================================
// base2/Hash.js
// =========================================================================

var _HASH = "#";

var Hash = Base.extend({
  constructor: function(values) {
    this.merge(values);
  },

  copy: delegate(copy),

  // Ancient browsers throw an error when we use "in" as an operator.
  exists: function(key) {
    /*@cc_on @*/
    /*@if (@_jscript_version < 5.5)
      return $Legacy.exists(this, _HASH + key);
    @else @*/
      return _HASH + key in this;
    /*@end @*/
  },

  fetch: function(key) {
    return this[_HASH + key];
  },

  forEach: function(block, context) {
    for (var key in this) if (key.charAt(0) == _HASH) {
      block.call(context, this[key], key.slice(1), this);
    }
  },

  merge: function(values) {
    var store = flip(this.store);
    forEach (arguments, function(values) {
      forEach (values, store, this);
    }, this);
    return this;
  },

  remove: function(key) {
    var value = this[_HASH + key];
    delete this[_HASH + key];
    return value;
  },

  store: function(key, value) {
    if (arguments.length == 1) value = key;
    // Create the new entry (or overwrite the old entry).
    return this[_HASH + key] = value;
  },

  union: function(values) {
    return this.merge.apply(this.copy(), arguments);
  }
});

Hash.implement(Enumerable);

// =========================================================================
// base2/Collection.js
// =========================================================================

// A Hash that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, store, insertAt, storeAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var _KEYS = "~";

var Collection = Hash.extend({
  constructor: function(values) {
    this[_KEYS] = new Array2;
    this.base(values);
  },
  
  add: function(key, item) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using store().
    assert(!this.exists(key), "Duplicate key '" + key + "'.");
    return this.store.apply(this, arguments);
  },

  copy: function() {
    var copy = this.base();
    copy[_KEYS] = this[_KEYS].copy();
    return copy;
  },

  count: function() {
    return this[_KEYS].length;
  },

  fetchAt: function(index) { // optimised (refers to _HASH)
    if (index < 0) index += this[_KEYS].length; // starting from the end
    var key = this[_KEYS][index];
    if (key !== undefined) return this[_HASH + key];
  },

  forEach: function(block, context) { // optimised (refers to _HASH)
    var keys = this[_KEYS];
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      block.call(context, this[_HASH + keys[i]], keys[i], this);
    }
  },

  indexOf: function(key) {
    return this[_KEYS].indexOf(String(key));
  },

  insertAt: function(index, key, item) {
    assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
    assert(!this.exists(key), "Duplicate key '" + key + "'.");
    this[_KEYS].insertAt(index, String(key));
    return this.store.apply(this, arguments);
  },
  
  item: Undefined, // alias of fetchAt (defined when the class is initialised)

  keys: function(index, length) {
    switch (arguments.length) {
      case 0:  return this[_KEYS].copy();
      case 1:  return this[_KEYS].item(index);
      default: return this[_KEYS].slice(index, length);
    }
  },

  remove: function(key) {
    // The remove() method of the Array object can be slow so check if the key exists first.
    var keyDeleted = arguments[1];
    if (keyDeleted || this.exists(key)) {
      if (!keyDeleted) {                   // The key has already been deleted by removeAt().
        this[_KEYS].remove(String(key));   // We still have to delete the value though.
      }
      return this.base(key);
    }
  },

  removeAt: function(index) {
    var key = this[_KEYS].removeAt(index);
    if (key !== undefined) return this.remove(key, true);
  },

  reverse: function() {
    this[_KEYS].reverse();
    return this;
  },

  sort: function(compare) { // optimised (refers to _HASH)
    if (compare) {
      var self = this;
      this[_KEYS].sort(function(key1, key2) {
        return compare(self[_HASH + key1], self[_HASH + key2], key1, key2);
      });
    } else this[_KEYS].sort();
    return this;
  },

  store: function(key, item) {
    if (arguments.length == 1) item = key;
    if (!this.exists(key)) {
      this[_KEYS].push(String(key));
    }
    var klass = this.constructor;
    if (klass.Item && !instanceOf(item, klass.Item)) {
      item = klass.create.apply(klass, arguments);
    }
    return this[_HASH + key] = item;
  },

  storeAt: function(index, item) {
    assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
    arguments[0] = this[_KEYS].item(index);
    return this.store.apply(this, arguments);
  },

  toString: function() {
    return String(this[_KEYS]);
  }
}, {
  Item: null, // If specified, all members of the collection must be instances of Item.
  
  init: function() {
    this.prototype.item = this.prototype.fetchAt;
  },
  
  create: function(key, item) {
    if (this.Item) return new this.Item(key, item);
  },
  
  extend: function(_instance, _static) {
    var klass = this.base(_instance);
    klass.create = this.create;
    extend(klass, _static);
    if (!klass.Item) {
      klass.Item = this.Item;
    } else if (typeof klass.Item != "function") {
      klass.Item = (this.Item || Base).extend(klass.Item);
    }
    klass.init();
    return klass;
  }
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var _RG_BACK_REF        = /\\(\d+)/g;
var _RG_ESCAPE_CHARS    = /\\./g;
var _RG_ESCAPE_BRACKETS = /\(\?[:=!]|\[[^\]]+\]/g;
var _RG_BRACKETS        = /\(/g;

var RegGrp = Collection.extend({
  constructor: function(values, flags) {
    this.base(values);
    if (typeof flags == "string") {
      this.global = /g/.test(flags);
      this.ignoreCase = /i/.test(flags);
    }
  },

  global: true, // global is the default setting
  ignoreCase: false,

  exec: function(string, replacement) { // optimised (refers to _HASH/_KEYS)
    string += ''; // type-safe
    if (arguments.length == 1) {
      var self = this;
      var keys = this[_KEYS];
      replacement = function(match) {
        if (!match) return "";
        var item, offset = 1, i = 0;
        // Loop through the RegGrp items.
        while (item = self[_HASH + keys[i++]]) {
          var next = offset + item.length + 1;
          if (arguments[offset]) { // do we have a result?
            var replacement = item.replacement;
            switch (typeof replacement) {
              case "function":
                var args = slice(arguments, offset, next);
                var index = arguments[arguments.length - 2];
                return replacement.apply(self, args.concat(index, string));
              case "number":
                return arguments[offset + replacement];
              default:
                return replacement;
            }
          }
          offset = next;
        }
      };
    }
    return string.replace(this.valueOf(), replacement);
  },

  test: function(string) {
    return this.exec(string) != string;
  },
  
  toString: function() {
    var length = 0;
    return "(" + this.map(function(item) {
      // Fix back references.
      var ref = String(item).replace(_RG_BACK_REF, function(match, index) {
        return "\\" + (1 + Number(index) + length);
      });
      length += item.length + 1;
      return ref;
    }).join(")|(") + ")";
  },
  
  valueOf: function(type) {
    if (type == "object") return this;
    var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
    return new RegExp(this, flags);
  }
}, {
  IGNORE: "$0",
  
  init: function() {
    forEach ("add,exists,fetch,remove,store".split(","), function(name) {
      extend(this, name, function(expression) {
        if (instanceOf(expression, RegExp)) {
          expression = expression.source;
        }
        return base(this, arguments);
      });
    }, this.prototype);
  },
  
  Item: {
    constructor: function(expression, replacement) {
      expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
      
      if (typeof replacement == "number") replacement = String(replacement);
      else if (replacement == null) replacement = "";    
      
      // does the pattern use sub-expressions?
      if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
        // a simple lookup? (e.g. "$2")
        if (/^\$\d+$/.test(replacement)) {
          // store the index (used for fast retrieval of matched strings)
          replacement = parseInt(replacement.slice(1));
        } else { // a complicated lookup (e.g. "Hello $2 $1")
          // build a function to do the lookup
          var Q = /'/.test(replacement.replace(/\\./g, "")) ? '"' : "'";
          replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
            "+(arguments[$1]||" + Q+Q + ")+" + Q);
          replacement = new Function("return " + Q + replacement.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q);
        }
      }
      
      this.length = RegGrp.count(expression);
      this.replacement = replacement;
      this.toString = returns(expression);
    },
    
    length: 0,
    replacement: ""
  },
  
  count: function(expression) {
    // Count the number of sub-expressions in a RegExp/RegGrp.Item.
    expression = String(expression).replace(_RG_ESCAPE_CHARS, "").replace(_RG_ESCAPE_BRACKETS, "");
    return match(expression, _RG_BRACKETS).length;
  }
});

// =========================================================================
// JavaScript/~/Function.js
// =========================================================================

// some browsers don't define this

Function.prototype.prototype = {};

// =========================================================================
// JavaScript/~/String.js
// =========================================================================

// fix String.replace (Safari/IE5.0)
if ("".replace(/^/, String)) {
  var _GLOBAL = /(g|gi)$/;
  extend(String.prototype, "replace", function(expression, replacement) {
    if (typeof replacement == "function") { // Safari doesn't like functions
      if (instanceOf(expression, RegExp)) {
        var regexp = expression;
        var global = regexp.global;
        if (global == null) global = _GLOBAL.test(regexp);
        // we have to convert global RexpExps for exec() to work consistently
        if (global) regexp = new RegExp(regexp.source); // non-global
      } else {
        regexp = new RegExp(rescape(expression));
      }
      var match, string = this, result = "";
      while (string && (match = regexp.exec(string))) {
        result += string.slice(0, match.index) + replacement.apply(this, match);
        string = string.slice(match.index + match[0].length);
        if (!global) break;
      }
      return result + string;
    }
    return this.base(expression, replacement);
  });
}

// =========================================================================
// JavaScript/Array2.js
// =========================================================================

var Array2 = _createObject2(
  Array,
  "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", // generics
  [Enumerable, {
    combine: function(keys, values) {
      // Combine two arrays to make a hash.
      if (!values) values = keys;
      return this.reduce(keys, function(object, key, index) {
        object[key] = values[index];
        return object;
      }, {});
    },

    contains: function(array, item) {
      return this.indexOf(array, item) != -1;
    },

    copy: function(array) {
      var copy = this.slice(array);
      if (!copy.swap) this(copy);  // cast to Array2
      return copy;
    },

    flatten: function(array) {
      var i = 0;
      return this.reduce(array, function(result, item) {
        if (this.like(item)) {
          this.reduce(item, arguments.callee, result, this);
        } else {
          result[i++] = item;
        }
        return result;
      }, [], this);
    },
    
    forEach: _Array_forEach,
    
    indexOf: function(array, item, fromIndex) {
      var length = array.length;
      if (fromIndex == null) {
        fromIndex = 0;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, length + fromIndex);
      }
      for (var i = fromIndex; i < length; i++) {
        if (array[i] === item) return i;
      }
      return -1;
    },
    
    insertAt: function(array, item, index) {
      this.splice(array, index, 0, item);
      return item;
    },
    
    item: function(array, index) {
      if (index < 0) index += array.length; // starting from the end
      return array[index];
    },
    
    lastIndexOf: function(array, item, fromIndex) {
      var length = array.length;
      if (fromIndex == null) {
        fromIndex = length - 1;
      } else if (from < 0) {
        fromIndex = Math.max(0, length + fromIndex);
      }
      for (var i = fromIndex; i >= 0; i--) {
        if (array[i] === item) return i;
      }
      return -1;
    },
  
    map: function(array, block, context) {
      var result = [];
      this.forEach (array, function(item, index) {
        result[index] = block.call(context, item, index, array);
      });
      return result;
    },
    
    remove: function(array, item) {
      var index = this.indexOf(array, item);
      if (index != -1) this.removeAt(array, index);
      return item;
    },

    removeAt: function(array, index) {
      return this.splice(array, index, 1);
    },

    swap: function(array, index1, index2) {
      var temp = array[index1];
      array[index1] = array[index2];
      array[index2] = temp;
      return array;
    }
  }]
);

Array2.reduce = Enumerable.reduce; // Mozilla does not implement the thisObj argument
Array2.prototype.forEach = delegate(_Array_forEach);

Array2.like = function(object) {
  // is the object like an array?
  return !!(object && typeof object == "object" && typeof object.length == "number");
};

// =========================================================================
// JavaScript/Date2.js
// =========================================================================

// http://developer.mozilla.org/es4/proposals/date_and_time.html

// big, ugly, regular expression
var _DATE_PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;  
var _DATE_PARTS = { // indexes to the sub-expressions of the RegExp above
  FullYear: 2,
  Month: 4,
  Date: 6,
  Hours: 8,
  Minutes: 10,
  Seconds: 12,
  Milliseconds: 14
};
var _TIMEZONE_PARTS = { // idem, but without the getter/setter usage on Date object
  Hectomicroseconds: 15, // :-P
  UTC: 16,
  Sign: 17,
  Hours: 18,
  Minutes: 20
};

var _TRIM_ZEROES   = /(((00)?:0+)?:0+)?\.0+$/;
var _TRIM_TIMEZONE = /(T[0-9:.]+)$/;

var Date2 = _createObject2(
  Date, "", [{
    toISOString: function(date) {
      var string = "####-##-##T##:##:##.###";
      for (var part in _DATE_PARTS) {
        string = string.replace(/#+/, function(digits) {
          var value = date["getUTC" + part]();
          if (part == "Month") value++; // js month starts at zero
          return ("000" + value).slice(-digits.length); // pad
        });
      }
      // remove trailing zeroes, and remove UTC timezone, when time's absent
      return string.replace(_TRIM_ZEROES, "").replace(_TRIM_TIMEZONE, "$1Z");
    }
  }]
);

Date2.now = function() {
  return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
  if (arguments.length > 1) {
    assertType(defaultDate, "number", "defaultDate should be of type 'number'.")
  }
  // parse ISO date
  var match = String(string).match(_DATE_PATTERN);
  if (match) {
    if (match[_DATE_PARTS.Month]) match[_DATE_PARTS.Month]--; // js months start at zero
    // round milliseconds on 3 digits
    if (match[_TIMEZONE_PARTS.Hectomicroseconds] >= 5) match[_DATE_PARTS.Milliseconds]++;
    var date = new Date(defaultDate || 0);
    var prefix = match[_TIMEZONE_PARTS.UTC] || match[_TIMEZONE_PARTS.Hours] ? "UTC" : "";
    for (var part in _DATE_PARTS) {
      var value = match[_DATE_PARTS[part]];
      if (!value) continue; // empty value
      // set a date part
      date["set" + prefix + part](value);
      // make sure that this setting does not overflow
      if (date["get" + prefix + part]() != match[_DATE_PARTS[part]]) {
        return NaN
      }
    }
    // timezone can be set, without time being available
    // without a timezone, local timezone is respected
    if (match[_TIMEZONE_PARTS.Hours]) {
      var Hours = Number(match[_TIMEZONE_PARTS.Sign] + match[_TIMEZONE_PARTS.Hours]);
      var Minutes = Number(match[_TIMEZONE_PARTS.Sign] + (match[_TIMEZONE_PARTS.Minutes] || 0));
      date.setUTCMinutes(date.getUTCMinutes() + (Hours * 60) + Minutes);
    } 
    return date.valueOf();
  } else {
    return Date.parse(string);
  }
};

// =========================================================================
// JavaScript/String2.js
// =========================================================================

var String2 = _createObject2(
  String,
  "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase",
  [{trim: trim}]
);

// =========================================================================
// JavaScript/functions.js
// =========================================================================

function _createObject2(Native, generics, extensions) {
  // Clone native objects and extend them.
  
  // Create a Module that will contain all the new methods.
  var INative = Module.extend();
  // http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
  forEach (generics.split(","), function(name) {
    INative[name] = unbind(Native.prototype[name]);
  });
  forEach (extensions, INative.implement, INative);
  
  // create a faux constructor that augments the native object
  var Native2 = function() {
    if (arguments[0] == Native.prototype) { // casting
      extend(Native, Native2);
    }
    return INative(this.constructor == INative ? Native.apply(Native, arguments) : arguments[0]);
  };
  Native2.prototype = INative.prototype;
  
  // Remove methods that are already implemented.
  forEach (INative, function(method, name) {
    if (Native[name]) {
      INative[name] = Native[name];
      delete INative.prototype[name];
    }
    Native2[name] = INative[name];
  });
  Native2.ancestor = Object;
  delete Native2.extend;
  
  return Native2;
};

// =========================================================================
// lang/extend.js
// =========================================================================

function extend(object, source) { // or extend(object, key, value)
  var extend = arguments.callee;
  if (object != null) {
    if (arguments.length > 2) { // Extending with a key/value pair.
      var key = String(source);
      var value = arguments[2];
      // Object detection.
      if (key.charAt(0) == "@") {
        return detect(key.slice(1)) ? extend(object, value) : object;
      }
      // Protect certain objects.
      if (object.extend == extend && /^(base|extend)$/.test(key)) {
        return object;
      }
      // Check for method overriding.
      var ancestor = object[key];
      if (ancestor && instanceOf(value, Function)) {
        if (value != ancestor && !_ancestorOf(value, ancestor)) {
          if (value._base || _BASE.test(value)) {
            // Override the existing method.
            var method = value;
            function _base() {
              var previous = this.base;
              this.base = ancestor;
              var returnValue = method.apply(this, arguments);
              this.base = previous;
              return returnValue;
            };
            value = _base;
            value.method = method;
            value.ancestor = ancestor;
          }
          object[key] = value;
        }
      } else {
        object[key] = value;
      }
    } else if (source) { // Extending with an object literal.
      var Type = instanceOf(source, Function) ? Function : Object;
      if (base2.__prototyping) {
        // Add constructor, toString etc if we are prototyping.
        forEach (_HIDDEN, function(key) {
          if (source[key] != Type.prototype[key]) {
            extend(object, key, source[key]);
          }
        });
      } else {
        // Does the target object have a custom extend() method?
        if (typeof object.extend == "function" && typeof object != "function" && object.extend != extend) {
          extend = unbind(object.extend);
        }
      }
      // Copy each of the source object's properties to the target object.
      _Function_forEach (Type, source, function(value, key) {
        extend(object, key, value);
      });
    }
  }
  return object;
};

function _ancestorOf(ancestor, fn) {
  // Check if a function is in another function's inheritance chain.
  while (fn && fn.ancestor != ancestor) fn = fn.ancestor;
  return !!fn;
};

// =========================================================================
// lang/forEach.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/07/enum/

if (typeof StopIteration == "undefined") {
  StopIteration = new Error("StopIteration");
}

function forEach(object, block, context, fn) {
  if (object == null) return;
  if (!fn) {
    if (instanceOf(object, Function)) {
      // Functions are a special case.
      fn = Function;
    } else if (typeof object.forEach == "function" && object.forEach != arguments.callee) {
      // The object implements a custom forEach method.
      object.forEach(block, context);
      return;
    } else if (typeof object.length == "number") {
      // The object is array-like.
      _Array_forEach(object, block, context);
      return;
    }
  }
  _Function_forEach(fn || Object, object, block, context);
};

// These are the two core enumeration methods. All other forEach methods
//  eventually call one of these two.

function _Array_forEach(array, block, context) {
  if (array == null) return;
  var length = array.length, i; // preserve length
  if (typeof array == "string") {
    for (i = 0; i < length; i++) {
      block.call(context, array.charAt(i), i, array);
    }
  } else {
    // Cater for sparse arrays.
    for (i = 0; i < length; i++) {    
      // Ignore undefined values. This is contrary to standard behaviour
      //  but it's what Internet Explorer does. We want consistent behaviour
      //  so we do this on all platforms.
      if (array[i] !== undefined) {
        block.call(context, array[i], i, array);
      }
    }
  }
};

function _get_Function_forEach() {
  // http://code.google.com/p/base2/issues/detail?id=10
  
  // run the test for Safari's buggy enumeration
  var Temp = function(){this.i=1};
  Temp.prototype = {i:1};
  var count = 0;
  for (var i in new Temp) count++;
  
  return (count > 1) ? function(fn, object, block, context) {
    ///////////////////////////////////////
    //    Safari fix (pre version 3)     //
    ///////////////////////////////////////    
    var processed = {};
    for (var key in object) {
      if (!processed[key] && fn.prototype[key] === undefined) {
        processed[key] = true;
        block.call(context, object[key], key, object);
      }
    }
  } : function(fn, object, block, context) {
    // Enumerate an object and compare its keys with fn's prototype.
    for (var key in object) {
      if (fn.prototype[key] === undefined) {
        block.call(context, object[key], key, object);
      }
    }
  };
};

// =========================================================================
// lang/instanceOf.js
// =========================================================================

function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).
  
  assertType(klass, "function", "Invalid 'instanceOf' operand.");
  
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.1)
    if ($Legacy.instanceOf(object, klass)) return true;
  @else @*/
    if (object instanceof klass) return true;
  /*@end @*/

  if (object == null) return false;

  // If the class is a Base class then it would have passed the test above.
  if (_isBaseClass(klass)) return false;

  // Base objects can only be instances of Object.
  if (_isBaseClass(object.constructor)) return klass == Object;
  
  switch (klass) {
    case Array: // This is the only troublesome one.
      return !!(typeof object == "object" && object.join && object.splice);
    case Function:
      return !!(typeof object == "function" && object.call);
    case RegExp:
      return object.constructor.prototype.toString() == _REGEXP_STRING;
    case Date:
      return !!object.getTimezoneOffset;
    case String:
    case Number:  // These are bullet-proof.
    case Boolean:
      return typeof object == typeof klass.prototype.valueOf();
    case Object:
      // Only JavaScript objects allowed.
      // COM objects do not have a constructor.
      return typeof object == "object" && typeof object.constructor == "function";
  }
  return false;
};

function _isBaseClass(klass) {
  return klass == Base || _ancestorOf(Base, klass);
};

// =========================================================================
// lang/assert.js
// =========================================================================

function assert(condition, message, Err) {
  if (!condition) {
    throw new (Err || Error)(message || "Assertion failed.");
  }
};

function assertArity(args, arity, message) {
  if (arity == null) arity = args.callee.length;
  if (args.length < arity) {
    throw new SyntaxError(message || "Not enough arguments.");
  }
};

function assertType(object, type, message) {
  if (type && (typeof type == "function" ? !instanceOf(object, type) : typeof object != type)) {
    throw new TypeError(message || "Invalid type.");
  }
};

// =========================================================================
// lang/core.js
// =========================================================================

function assignID(object) {
  // Assign a unique ID to an object.
  if (!object.base2ID) object.base2ID = "b2_" + _ID++;
  return object.base2ID;
};

function copy(object) {
  var fn = function(){};
  fn.prototype = object;
  return new fn;
};

// String/RegExp.

function format(string) {
  // Replace %n with arguments[n].
  // e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
  // ==> "she sells sea shells"
  // Only %1 - %9 supported.
  var args = arguments;
  var _FORMAT = new RegExp("%([1-" + arguments.length + "])", "g");
  return String(string).replace(_FORMAT, function(match, index) {
    return index < args.length ? args[index] : match;
  });
};

function match(string, expression) {
  // Same as String.match() except that this function will return an empty 
  // array if there is no match.
  return String(string).match(expression) || [];
};

function rescape(string) {
  // Make a string safe for creating a RegExp.
  return String(string).replace(_RESCAPE, "\\$1");
};

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
  return String(string).replace(_LTRIM, "").replace(_RTRIM, "");
};

// =========================================================================
// lang/functional.js
// =========================================================================

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

// =========================================================================
// base2/init.js
// =========================================================================

base2 = new Namespace(this, base2);
eval(this.exports);

base2.extend = extend;

forEach (Enumerable, function(method, name) {
  if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});

// =========================================================================
// base2/utils/namespace.js
// =========================================================================

var utils = new base2.Namespace(this, {name: "utils"});

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JST/namespace.js
// =========================================================================

// JavaScript Templates

/*
	Based on the work of Erik Arvidsson:
  	http://erik.eae.net/archives/2005/05/27/01.03.26/
*/

var JST = new base2.Namespace(this, {
	name:    "JST",
	version: "0.9",
	exports: "Command, Interpreter, Parser"
});

eval(this.imports);

// =========================================================================
// JST/Command.js
// =========================================================================

var STDOUT = 1;

var Command = Base.extend({
	constructor: function(command) {
  	this[STDOUT] = [];  	
  	this.extend(command); // additional commands
  },
	
	echo: function(string) {
  	this[STDOUT].push(string);
  }
});

// =========================================================================
// JST/Interpreter.js
// =========================================================================

var Interpreter = Base.extend({
	constructor: function(command) {
  	this.command = command || {};
  	this.parser = new Parser;
  },
	
	command: null,
	parser: null,
	
	interpret: function(template) {
  	var command = new Command(this.command);
  	var code = base2.namespace + "with(arguments[0]){" +
    	this.parser.parse(template) + 
    "}return arguments[0][1].join('')";
    // use new Function() instead of eval() so that the script is evaluated in the global scope
  	return new Function(code)(command);
  }
});

// =========================================================================
// JST/Escape.js
// =========================================================================

var Escape = Module.extend({
	escape: function(parser, string) {
  	if (parser.escapeChar) {
      // encode escaped characters
    	var ESCAPE = new RegExp(rescape(parser.escapeChar + "."), "g");
    	string = string.replace(ESCAPE, function(match) {
      	return String.fromCharCode(Escape.BASE + match.charCodeAt(1));
      });
    }
  	return string;
  },
	
	unescape: function(parser, string) {
    // decode escaped characters
  	if (parser.escapeChar) {
    	string = string.replace(Escape.RANGE, function(match) {
      	return parser.escapeChar + String.fromCharCode(match.charCodeAt(0) - Escape.BASE);
      });
    }
  	return string;
  }
}, {
	BASE: 65280,
	RANGE: /[\uff00-\uffff]/g
});

// =========================================================================
// JST/Parser.js
// =========================================================================

// this needs a re-write but it works well enough for now.

var Parser = Base.extend({
	escapeChar: "\\",
	
	parse: function(string) {
  	return this._decode(this._encode(String(string)));
  },
	
	_decode: function(string) {
  	var evaluated = this._evaluated;
  	while (Parser.EVALUATED.test(string)) {
    	string = string.replace(Parser.EVALUATED, function(match, index) {
      	return evaluated[index];
      });
    }
  	delete this._evaluated;
  	return this.unescape(string);
  },
	
	_encode: function(string) {  	
  	var TRIM = /^=|;+$/g;
  	var BLOCK = /<%[^%]*%([^>][^%]*%)*>/g;
  	var evaluated = this._evaluated = [];
  	var evaluate = function(block) {
    	block = block.replace(Parser.TRIM, "");
    	if (!block) return "";
    	if (block.charAt(0) == "=") {
      	block = "\necho(" + block.replace(TRIM, "") + ");";
      }
    	var replacement = "\x01" + evaluated.length + "\x01";
    	evaluated.push(block);
    	return replacement;
    };
  	return Parser.TEXT.exec(this.escape(string).replace(BLOCK, evaluate));
  }
}, {
	ESCAPE: new RegGrp({
  	'\\\\': '\\\\',
  	'"':    '\\"',
  	'\\n':  '\\n',
  	'\\r':  '\\r'
  }),
	EVALUATED: /\x01(\d+)\x01/g,
	TEXT: new RegGrp({
    "\\x01\\d+\\x01": RegGrp.IGNORE,
    "[^\\x01]+": function(match) {
    	return '\necho("' + Parser.ESCAPE.exec(match) + '");';
    }
  }),
	TRIM: /^<%\-\-.*\-\-%>$|^<%\s*|\s*%>$/g
});

Parser.implement(Escape);

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSON/namespace.js
// =========================================================================

// This code is loosely based on Douglas Crockford's original:
//  http://www.json.org/json.js

// This is not a particularly great implementation. I hacked it together to
//  support another project. It seems to work well enough though.

var JSON = new base2.Namespace(this, {
  name:    "JSON",
  version: "0.9",

  // IE5.0 doesn't like non-greedy RegExps
  //VALID: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/,
  VALID: /^("(\\.|[^"\\\n\r])*"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])*$/,
  
  copy: function(object) {
    // use JSON to make a deep copy of an object
    return this.parse(this.toString(object));
  },
  
  parse: function(string) {
    return this.String.parseJSON(string);
  }
});

eval(this.imports);

extend(JSON, "toString", function(object) {
  if (arguments.length == 0) return this.base();
  // find the appropriate module
  var module = this.Object; // default
  try {
    forEach (this, function(property, name) {
      if (JSON.Object.ancestorOf(property) && instanceOf(object, global[name])) {
        module = property;
        throw StopIteration;
      }
    });
  } catch (error) {
    if (error != StopIteration) throw error;
  }
  return module.toJSONString(object);
});

// =========================================================================
// JSON/Object.js
// =========================================================================

JSON.Object = Module.extend({
  toJSONString: function(object) {
    return object === null ? "null" : "{" + reduce(object, function(properties, property, name) {
      if (JSON.Object.isValid(property)) {
        properties.push(JSON.String.toJSONString(name) + ":" + JSON.toString(property));
      }
      return properties;
    }, []).join(",") + "}";
  }
}, {
  VALID_TYPE: /object|boolean|number|string/,
  
  isValid: function(object) {
    return this.VALID_TYPE.test(typeof object);
  }
});

// =========================================================================
// JSON/Array.js
// =========================================================================

JSON.Array = JSON.Object.extend({
  toJSONString: function(array) {
    return "[" + reduce(array, function(items, item) {
      if (JSON.Object.isValid(item)) {
        items.push(JSON.toString(item));
      }
      return items;
    }, []).join(",") + "]";
  }
});

// =========================================================================
// JSON/Boolean.js
// =========================================================================

JSON.Boolean = JSON.Object.extend({
  toJSONString: function(bool) {
    return String(bool);
  }
});

// =========================================================================
// JSON/Date.js
// =========================================================================

JSON.Date = JSON.Object.extend({
  toJSONString: function(date) {
    var pad = function(n) {
      return n < 10 ? "0" + n : n;
    };
    return '"' + date.getUTCFullYear() + "-" +
      pad(date.getUTCMonth() + 1) + "-" +
      pad(date.getUTCDate()) + "T" +
      pad(date.getUTCHours()) + ":" +
      pad(date.getUTCMinutes()) + ":" +
      pad(date.getUTCSeconds()) + 'Z"';
  }
});

// =========================================================================
// JSON/Number.js
// =========================================================================

JSON.Number = JSON.Object.extend({
  toJSONString: function(number) {
    return isFinite(number) ? String(number) : "null";
  }
});

// =========================================================================
// JSON/String.js
// =========================================================================

JSON.String = JSON.Object.extend({
  parseJSON: function(string) {
    try {
      if (JSON.VALID.test(string)) {
        return eval("(" + string + ")");
      }
    } catch (error) {
      throw new SyntaxError("parseJSON");
    }
  },

  toJSONString: function(string) {
    return '"' + this.ESCAPE.exec(string) + '"';
  }
}, {
  ESCAPE: new RegGrp({
    '\b':   '\\b',
    '\\t':  '\\t',
    '\\n':  '\\n',
    '\\f':  '\\f',
    '\\r':  '\\r',
    '"' :   '\\"',
    '\\\\': '\\\\',
    '[\\x00-\\x1f]': function(chr) {
      var charCode = chr.charCodeAt(0);
      return '\\u00' + Math.floor(charCode / 16).toString(16) + (charCode % 16).toString(16);
    }
  })
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// IO/namespace.js
// =========================================================================

var IO = new base2.Namespace(this, {
  name:    "IO",
  version: "0.4",
  exports: "FileSystem, Directory, LocalFileSystem, LocalDirectory, LocalFile, JSONFileSystem, JSONDirectory"
});

eval(this.imports);

function NOT_SUPPORTED() {
  throw new Error("Not supported.");
};

// =========================================================================
// utils/XPCOM.js
// =========================================================================

// some useful methods for dealing with XPCOM

var XPCOM = Module.extend({
  privelegedMethod: I, // no such thing as priveleged for non-Mozilla browsers
  privelegedObject: I,
  
  "@(Components)": {
    createObject: function(classPath, interfaceId) {
      if (classPath.charAt(0) != "@") {
        classPath = "@mozilla.org/" + classPath;
      }
      try {
        return new (new Components.Constructor(classPath, interfaceId));
      } catch (error) {
        throw new Error(format("Failed to create object '%1' (%2).", interfaceId, error.message));
      }
    },
    
    privelegedMethod: function(method) {
      return function() {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        return method.apply(this, arguments);
      };
    },
    
    privelegedObject: function(object) {
      Base.forEach (object, function(method, name) {
        if (typeof method == "function") {
          object[name] = XPCOM.privelegedMethod(method);
        }
      });
    }
  }
});

// =========================================================================
// IO/FileSystem.js
// =========================================================================

// A base class to derive file systems from.
// Here we'll define all the path management code.

var FileSystem = Base.extend({
  path: "/",
  
  chdir: function(path) {
    // set the current path
    path = this.makepath(path);
    if (!/\/$/.test(path)) { // trailing slash?
      if (this.isDirectory(path)) {
        // if it's a directory add the slash
        path += "/";
      } else {
        // if it's not then trim to the last slash
        path = path.replace(/[^\/]+$/, "");
      }
    }
    this.path = path;
  },
  
  makepath: function(path1, path2) {
    if (arguments.length == 1) {
      path2 = path1;
      path1 = this.path;
    }
    return FileSystem.resolve(path1, path2);
  }, 
    
  copy: NOT_SUPPORTED,
  exists: NOT_SUPPORTED,
  isDirectory: NOT_SUPPORTED,
  isFile: NOT_SUPPORTED,
  mkdir: NOT_SUPPORTED,
  move: NOT_SUPPORTED,
  read: NOT_SUPPORTED,
  remove: NOT_SUPPORTED,
  write: NOT_SUPPORTED
}, {
  resolve: function(path1, path2) {
    var FILENAME = /[^\/]+$/;
    var RELATIVE = /\/[^\/]+\/\.\./;
    // stringify
    path1 = String(path1 || "");
    path2 = String(path2 || "");
    // create a full path from two paths
    if (path2.charAt(0) == "/") {
      var path = "";
    } else {
      path = path1.replace(FILENAME, "");
    }
    path += path2;
    // get rid of ../ relative paths
    while (RELATIVE.test(path)) {
      path = path.replace(RELATIVE, "");
    }
    return path;
  }
});

// =========================================================================
// IO/Directory.js
// =========================================================================

// A collection of stubs that map out the directory structure.
// -- it's too expensive to create full file objects...

var Directory = Collection.extend({
  sort: function() {
    return this.base(function(file1, file2, name1, name2) {
      if (file1.isDirectory != file2.isDirectory) {
        return file1.isDirectory ? -1 : 1; 
      } else {
        return name1 < name2 ? -1 : 1; 
      }
    });
  }
}, {
  Item: {
    constructor: function(name, isDirectory, size) {
      this.name = String(name);
      this.isDirectory = Boolean(isDirectory);
      this.size = Number(size || 0);
    },
    
    toString: function() {
      return this.name;
    }
  }
});

// =========================================================================
// IO/LocalFileSystem.js
// =========================================================================

var LocalFileSystem = FileSystem.extend({
  read: function(path) {
    return LocalFile.read(path);
  },

  write: function(path, text) {
    return LocalFile.write(path, text);
  },

  "@(ActiveXObject)": {
    constructor: function() {
      this.$fso = new ActiveXObject("Scripting.FileSystemObject");
    },
    
    copy: function(path1, path2) {
      var method = this.isDirectory(path1) ? "CopyFolder" : "CopyFile";
      this.$fso[method](path1, path2, true);
    },

    exists: function(path) {
      return this.isFile() || this.isDirectory();
    },

    isFile: function(path) {
      return this.$fso.FileExists(path);
    },
    
    isDirectory: function(path) {
      return this.$fso.FolderExists(path);
    },
  
    mkdir: function(path) {
      return this.$fso.CreateFolder(path);
    },
    
    move: function(path1, path2) {
      var method = this.isDirectory(path1) ? "MoveFolder" : "MoveFile";
      this.$fso[method](path1, path2);
    },
    
    read: function(path) {
      if (this.isDirectory(path)) {
        return new LocalDirectory(this.$fso.GetFolder(path));
      }
      return this.base(path);
    },
    
    remove: function(path) {
      if (this.isFile(path)) {
        this.$fso.DeleteFile(path);
      } else if (this.isDirectory(path)) {
        this.$fso.DeleteFolder(path);
      }
    }
  },

  "@(Components)": { // XPCOM
    constructor: function() {
      this.$nsILocalFile = LocalFile.$createObject();
    },
    
    copy: function(path1, path2) {
      return this.$nsILocalFile.copyTo(path2);
    },
    
    exists: function(path) {
      return this.$nsILocalFile.exists();
    },
    
    isFile: function(path) {
      return this.exists() && this.$nsILocalFile.isFile();
    },
    
    isDirectory: function(path) {
      return this.exists() && this.$nsILocalFile.isDirectory();
    },
  
    mkdir: function(path) {
      return this.$nsILocalFile.create(1);
    },
    
    move: function(path1, path2) {
      return this.$nsILocalFile.moveTo(path2);
    },
    
    read: function(path) {
      if (this.isDirectory(path)) {
        return new LocalDirectory(this.$nsILocalFile.directoryEntries);
      }
      return this.base(path);
    },
    
    remove: function(path) {
      this.$nsILocalFile.remove(false);
    }
  },

  "@(java && !global.Components)": {
    exists: function(path) {
      return new java.io.File(path).exists();
    }
  }
}, {
  "@(Components)": { // XPCOM
    init: function() {
      XPCOM.privelegedObject(this.prototype);
    }
  }
});

// =========================================================================
// IO/LocalDirectory.js
// =========================================================================

var LocalDirectory = Directory.extend({
  "@(ActiveXObject)": {
    constructor: function(directory) {
      this.base();
      var files = directory.files;
      var length = files.Count();      
      for (var i = 0; i < length; i++) {
        this.store(files.item(i));
      }
    }
  },

  "@(Components)": { // XPCOM
    constructor: XPCOM.privelegedMethod(function(directory) {
      this.base();
      var enumerator = directory.QueryInterface(Components.interfaces.nsIDirectoryEnumerator);
      while (enumerator.hasMoreElements()) {
        this.store(enumerator.nextFile);
      }
    })
  }
}, {
  "@(ActiveXObject)": {  
    create: function(name, file) {
      return new this.Item(file.Name, file.Type | 16, file.Size);
    }
  },

  "@(Components)": {
    create: function(name, file) {
      return new this.Item(file.leafName, file.isDirectory(), file.fileSize);
    }
  }
});

// =========================================================================
// IO/LocalFile.js
// =========================================================================

// A class for reading/writing the local file system. Works for Moz/IE/Opera(java)
// the java version seems a bit buggy when writing...?

var LocalFile = Base.extend({
  constructor: function(path, mode) {
    assignID(this);
    this.path = LocalFile.makepath(path);
    if (mode) this.open(mode);
  },
  
  mode: 0,
  path: "",

  close: function() {
    delete LocalFile.opened[this.base2ID];
    delete this.$stream;
    this.mode = LocalFile.CLOSED;
  },

  open: function(mode) {
    this.mode = mode || LocalFile.READ;
    LocalFile.opened[this.base2ID] = this;
  },

  exists: NOT_SUPPORTED,
  read: NOT_SUPPORTED,
  remove: NOT_SUPPORTED,
  write: NOT_SUPPORTED,

  "@(ActiveXObject)": {
    constructor: function(path, mode) {
      this.$fso = new ActiveXObject("Scripting.FileSystemObject");
      this.base(path, mode);
    },
    
    close: function() {
      if (this.$stream) {
        this.$stream.Close();
        this.base();
      }
    },

    exists: function() {
      return this.$fso.FileExists(this.path);
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        switch (this.mode) {
          case LocalFile.READ:
            if (!this.exists()) {
              this.mode = LocalFile.CLOSED;
              break;
            }
            this.$stream = this.$fso.OpenTextFile(this.path, 1);
            break;
          case LocalFile.WRITE:
            this.$stream = this.$fso.OpenTextFile(this.path, 2, -1, 0);
            break;
        }
      }
    },

    read: function() {
      return this.$stream.ReadAll();
    },

    remove: function() {
      return this.$fso.GetFile(this.path).Delete();
    },

    write: function(text) {
      this.$stream.Write(text || "");
    }
  },

  "@(Components)": { // XPCOM
    constructor: function(path, mode) {
      this.$nsILocalFile = LocalFile.$createObject();
      this.base(path, mode);
    },
      
    $init: function() {
      var file = this.$nsILocalFile;
      try {
        file.initWithPath(this.path);
      } catch (error) {
        file.initWithPath(location.pathname);
        file.setRelativeDescriptor(file, this.path);
      }
      return file;
    },

    close: function() {
      if (this.$stream) {
        if (this.mode == LocalFile.WRITE) this.$stream.flush();
        this.$stream.close();
        this.base();
      }
    },

    exists: function() {
      return this.$init().exists();
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        var file = this.$init();
        switch (this.mode) {
          case LocalFile.READ:
            if (!file.exists()) {
              this.mode = LocalFile.CLOSED;
              break;
            }
            var $stream = XPCOM.createObject("network/file-input-stream;1", "nsIFileInputStream");
            $stream.init(file, 0x01, 00004, null);
            this.$stream = XPCOM.createObject("scriptableinputstream;1", "nsIScriptableInputStream");
            this.$stream.init($stream);
            break;
          case LocalFile.WRITE:
            if (!file.exists()) file.create(0, 0664);
            this.$stream = XPCOM.createObject("network/file-output-stream;1", "nsIFileOutputStream");
            this.$stream.init(file, 0x20 | 0x02, 00004, null);
            break;
        }
      }
    },

    read: function() {
      return this.$stream.read(this.$stream.available());
    },

    remove: function() {
      this.$init().remove(false);
    },

    write: function(text) {
      if (text == null) text = ""; 
      this.$stream.write(text, text.length);
    }
  },

  "@(java && !global.Components)": {
    close: function() {
      if (this.$stream) {
        this.$stream.close();
        this.base();
      }
    },

    exists: function() {
      var file = new java.io.File(this.path);
      return file.exists();
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        switch (this.mode) {
          case LocalFile.READ:
            var file = new java.io.FileReader(this.path);
            this.$stream = new java.io.BufferedReader(file); 
            break;
          case LocalFile.WRITE:
            var file = new java.io.FileOutputStream(this.path);
            this.$stream = new java.io.PrintStream(file);
            break;
        }
      }
    },

    read: function() {
      var lines = [];
      var line, i = 0;
      while ((line = this.$stream.readLine()) != null) {
        lines[i++] = line;
      }
      return lines.join("\r\n");
    },

    write: function(text) {
      this.$stream.print(text || "");
    }
  }
}, {
  CLOSED: 0,
  READ: 1,
  WRITE: 2,

  opened: {},
  
  backup: function(fileName, backupName) {
    var text = this.read(fileName);
    this.write(backupName || (fileName + ".backup"), text);
    return text;
  },

  closeAll: function() {
    var files = this.opened;
    for (var i in files) files[i].close();
  },

  exists: function(fileName) {
    return new this(fileName).exists();
  },

  makepath: function(fileName) {
    var SLASH = /\//g;
    var BACKSLASH = /\\/g;
    var TRIM = /[^\/]+$/;
    fileName = String(fileName || "").replace(BACKSLASH, "/");
    var path = location.pathname.replace(BACKSLASH, "/").replace(TRIM, "");
    path = FileSystem.resolve(path, fileName).slice(1);
    return decodeURIComponent(path.replace(SLASH, "\\"));
  },

  read: function(fileName) {
    var file = new this(fileName, this.READ);
    var text = file.mode ? file.read() : "";
    file.close();
    return text;
  },

  remove: function(fileName) {
    var file = new this(fileName);
    file.remove();
  },

  write: function(fileName, text) {
    var file = new this(fileName, this.WRITE);
    file.write(text);
    file.close();
  },
  
  "@(Components)": {
    init: function() {
      XPCOM.privelegedObject(this.prototype);    
      this.$createObject = XPCOM.privelegedMethod(function() {
        return XPCOM.createObject("file/local;1", "nsILocalFile");
      });
    }
  }
});

// =========================================================================
// IO/JSONFileSystem.js
// =========================================================================

var _FETCH = "#fetch";

var JSONFileSystem = FileSystem.extend({
  constructor: function(data) {
    this[_FETCH] = function(path) {
      // fetch data from the JSON object, regardless of type
      path = this.makepath(path);
      return reduce(path.split("/"), function(file, name) {
        if (file && name) file = file[name];
        return file;
      }, data);
    };
  },
  
  exists: function(path) {
    return this[_FETCH](path) !== undefined;
  },
  
  isFile: function(path) {
    return typeof this[_FETCH](path) == "string";
  },
  
  isDirectory: function(path) {
    return typeof this[_FETCH](path) == "object";
  },

  copy: function(path1, path2) {
    var data = this[_FETCH](path1);
    this.write(path2, JSON.copy(data));
  },
  
  mkdir: function(path) {
    // create a directory
    this.write(path, {});
  },
  
  move: function(path1, path2) {
    var data = this[_FETCH](path1);
    this.write(path2, data);
    this.remove(path1);
  },

  read: function(path) {    
    // read text from the JSON object
    var file = this[_FETCH](path);
    return typeof file == "object" ?
      new JSONDirectory(file) : file || ""; // make read safe
  },
  
  remove: function(path) {
    // remove data from the JSON object
    path = path.replace(/\/$/, "").split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    if (directory) delete directory[filename];
  },

  write: function(path, data) {
    // write data to the JSON object
    path = path.split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    assert(directory, "Directory not found."); 
    return directory[filename] = data || "";
  }
});

// =========================================================================
// IO/JSONDirectory.js
// =========================================================================

var JSONDirectory = Directory.extend(null, {
  create: function(name, item) {
    return new this.Item(name, typeof item == "object", item && item.length);
  }
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// MiniWeb/namespace.js
// =========================================================================
/*
  MiniWeb - copyright 2007, Dean Edwards
  http://www.opensource.org/licenses/mit-license
*/

// An active document thing

MiniWeb = new base2.Namespace(this, {
  name:    "MiniWeb",
  exports: "Client,Server,FileSystem,Command,Interpreter,Terminal,Request,History",
  imports: "IO",
  version: "0.6",
  
  $$: {data: {}},
  
  DOCTYPE: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
  SCRIPT:  '<script type="text/javascript">\r\n%1\r\n<\/script>',
  
  client: null,
  dirty: false,
  readOnly: true,
  server: null,
  terminal: null,
  
  init: function() {
    // create page style
    document.write("<style>html,body{margin:0;padding:0;height:100%;overflow:hidden}#window{width:100%;height:100%;}</style>");
    
    // delegate some methods to the client
    var methods = "navigateTo,refresh,reload,submit".split(",");
    base2.forEach (methods, function(method) {
      this[method] = function() {
        var args = arguments;
        var client = MiniWeb.client;
        // use a timer to jump out of an event
        setTimeout(function() {
          client[method].apply(client, args);
        }, 0);
      };
    }, this);
    
    window.onload = function() {
      MiniWeb.server = new Server;
      // get server options
      var request = new Request("OPTIONS");
      var allow = request.getResponseHeader("Allow");
      MiniWeb.readOnly = !/PUT/.test(allow);
      MiniWeb.terminal = new Terminal;
      MiniWeb.client = new Client;
    };
  },
  
  register: function(window) {
    this.client.register(window);
  },
  
  resolve: function(path, filename) {
    return IO.FileSystem.resolve(path, filename);
  },
  
  save: function(name) {
    if (this.readOnly) {
      alert(
        "You cannot save your changes over HTTP.\n" +
        "Instead, save this page to your hard disk.\n" +
        "If you edit the local version you will then\n" +
        "be able to save your changes."
      );
      return false;
    }
    // save the state of the terminal
    if (!name) Terminal.save(this.terminal);

    // update the revision number of the document
    var REVISION = "/system/About/revision";
    var io = this.server.io;
    var revision = parseInt(io.read(REVISION));
    io.write(REVISION, String(++revision));

    // collect external scripts
    var SCRIPT = '<script type="text/javascript" src="%1"><\/script>';
    var scripts = [];
    forEach (document.getElementsByTagName("script"), function(script) {
      if (script.src) {
        scripts.push(format(SCRIPT, Command.HTML_ESCAPE.exec(script.src)));
      }
    });

    forEach (this.$$, function(value, name) {
      if (name != "data") {
        var entry = "MiniWeb.$$." + name + "=" + JSON.toString(value).replace(/<\//g, "<\\/");
        scripts.push(format(this.SCRIPT, entry));
      }
    }, this);
    
    var data = [];
    forEach (this.$$.data, function(value, name) {
      var entry = "MiniWeb.$$.data." + name + "=" + JSON.toString(value).replace(/<\//g, "<\\/");
      data.push(format(this.SCRIPT, entry));
    }, this);
    
    
    // it's mostly script :-)
    var html = Array2.flatten([
      this.DOCTYPE,
      "<head>",
      "<title>MiniWeb: " + this.client.address + "<\/title>",
      scripts,
      "<body>",
      data,
      ""
    ]).join("\r\n");
    
    if (!name) LocalFile.backup(location.pathname);
    LocalFile.write(name || location.pathname, html);
    if (!name) location.reload();
    
    return true;
  },
  
  send: function(request, data) {
    if (this.client) {
      request.referer = this.client.address;
    }
    this.server.respond(request, data);
  }
});

eval(this.imports);

MiniWeb.toString = function() {
  return "MiniWeb version " + MiniWeb.version;
};

// =========================================================================
// MiniWeb/Client.js
// =========================================================================

// The client object wraps an <iframe> that contains the rendered page

var Client = Base.extend({
  constructor: function() {
    var client = this;

    this.history = new History(function() { // callback
      var address = location.hash.slice(1);
      client.send("GET", address);
      client.address = address;
      client.refresh();
    });
    
    // the url of the hosting page
    this.host = location.href.slice(0, -location.hash.length);
    
    this.view = document.createElement("iframe");
    this.view.style.display = "none";
    document.body.appendChild(this.view);
    
    window.onunload = function() {
      try {
        client.view = null;
        if (client.window) {
          client.window.onunload();
          client.window = null;
        }
        clearInterval(client.history.timer);
      } catch (error) {
        // ignore
      }
    };
  },
  
  address: "",
  history: null,
  host: "",
  response: null,
  view: null,
  window: null,
  
  fixForm: function(form) {
    // intercept form submissions
    form.onsubmit = Client.onsubmit;
  },
  
  fixLink: function(link) {
    // stylise links - add classes for visited etc
    var href = link.getAttribute("href");
    // extract the hash portion and create a path
    href = String(href || "").replace(this.host, "");
    if (/^#[^\/]/.test(href)) {
      var hash = location.hash.replace(/^#(.*!)?/, "");
      href = "#" + hash.replace(/[^\/]+$/, "") + href.slice(1);
    }
    if (/^#/.test(href)) {
      link.setAttribute("href", href);
      if (this.history.visited[href]) {
        link.className += " mw-visited";
      }
      link.target = "_parent";
      link.onclick = Client.onclick;
    }
  },
  
  fixStyle: function(style) {
    style.innerHTML = style.innerHTML.replace(/:(visited)/g, ".mw-$1");
  },
  
  navigateTo: function(url) {
    // load a new page
    var hash = /^#/.test(url) ? url.slice(1) : url;
    if (this.address != hash) {      
      var request = new Request("HEAD", hash);
      if (request.status == 301) {
        hash = request.getResponseHeader("Location");
      }
      this.history.add("#" + hash);
    }
  },
  
  refresh: function() {
    // refresh the current page from the last response
    
    // insert a script
    var script = "parent.MiniWeb.register(this);var base2=parent.base2;" + base2.namespace;
    script = format(MiniWeb.SCRIPT, script);
    var html = this.response.replace(/(<head[^>]*>)/i, "$1\n" + script);
    
    // create an iframe to display the page
    var iframe = document.createElement(Client.$IFRAME);
    iframe.frameBorder = "0";
    iframe.id = "window";
    document.body.replaceChild(iframe, this.view);
    this.view = iframe;
    
    // write the html
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    
    // fix the page
    forEach (doc.links, this.fixLink, this);
    forEach (doc.getElementsByTagName("style"), this.fixStyle, this);
    forEach (doc.forms, this.fixForm, this);
    
    if (typeof doc.activeElement == "undefined") {
      doc.onclick = function(event) {
        this.activeElement = event.target;
      };
    }
    
    // keep the browser title in sync
    document.title = doc.title;
  },
  
  register: function(window) {
    window.MiniWeb = MiniWeb;
    window.onunload = function() { // destroy
      this.MiniWeb = null;
    };
    this.window = window;
  },
  
  reload: function() {
    // reload the current page
    this.send("GET", this.address);
    this.refresh();
  },
  
  send: function(method, url, data, headers) {
    // it's all synchronous ;-)
    this.response = new Request(method, url, data, headers).responseText;
  },
  
  submit: function(form) {
    // post form data
    this.send("POST", form.action || this.address, HTMLFormElement.serialize(form));
    this.refresh();
  },
  
  "@MSIE": {
    fixStyle: function(style) {
      style = style.styleSheet;
      style.cssText = style.cssText.replace(/:visited/g, ".mw-visited");
    },
    
    refresh: function() {
      // IE needs a kick up the butt
      //  this will cause the unload event to fire in the iframe
      this.view.contentWindow.document.write();
      this.base();
    }
  }
}, {
  $IFRAME: "iframe",
  
  onclick: function() {  
    var href = this.getAttribute("href", 2);
    if (href && !/^\w+:/.test(href) ) {
      if (!/current/.test(this.className)) {
        MiniWeb.navigateTo(href);
      }
      return false;
    }
  },
  
  onsubmit: function() {
    MiniWeb.submit(this);
    return false;
  },
  
  "@MSIE": {
    $IFRAME: "<iframe scrolling=yes>"
  }
});

// =========================================================================
// MiniWeb/History.js
// =========================================================================

// Manage back/forward buttons

var History = Base.extend({
  constructor: function(callback) {
    this.visited = {};
  //-  var scrollTop = this.scrollTop = {};
    
    var hash;
    this.timer = setInterval(function() {
      if (hash != location.hash) {
        hash = location.hash;
        callback();
      //-  document.documentElement.scrollTop = scrollTop[hash];
      }
    }, 20);
    
  /*  // preserve scroll position
    window.onscroll = function() {
      if (hash == location.hash) {
        scrollTop[hash] = document.documentElement.scrollTop;
      }
    }; */
    
    this.add(location.hash || ("#" + (document.title.slice(9) || "/")));
  },
  
  timer: 0,
  visited: null,
  
  add: function(hash) {
    if (location.hash != hash) {
      location.hash = hash;
    }
  //-  this.scrollTop[hash] = 0;
    this.visited[hash] = true;
  },
  
  "@MSIE": {
    add: function(hash) {
      History.$write(hash);
      this.base(hash);
    }
  }
}, {    
  init: function() {
    // the hash portion of the location needs to be set for history to work properly
    // -- we need to do it before the page has loaded
    if (!location.hash) location.replace("#" + (document.title.slice(9) || "/"));
  },
  
  "@MSIE": {
    $write: function(hash) {
      if (hash != location.hash) {
        var document = frames[0].document;
        document.open(); // -dean: get rid?
        document.write("<script>parent.location.hash='" + hash + "'<\/script>");
        document.close(); // -DRE
      }
    },
    
    init: function() {
      this.base();
      document.write("<iframe style=display:none></iframe>");
      this.$write(location.hash.slice(1)); // make sure it's unique the first time
    }
  }
});

// =========================================================================
// MiniWeb/Server.js
// =========================================================================

// The Server object responds to client requests

var Server = Base.extend({
  constructor: function() {
    this.io = new FileSystem;
  },
  
  io: null,
  
  interpret: function(request) {
    var interpreter = new Interpreter(request);
    try {
      return interpreter.interpret();
    } catch (error) {
      request.command = JSON.copy(interpreter);
      throw error;
    }
  },
  
  respond: function(request, data) {
    // repsond to a client request
    try {
      request.status = 202; // Accepted
      request.readyState = 3; // Receiving
      request.headers["Server"] = String(MiniWeb);
      request.post = {};
      if (typeof Server[request.method] == "function") {
        // use static methods to resolve the request method
        Server[request.method](this, request, data);
      } else {
        request.status = 405; // Method Not Allowed
      }
    } catch (error) {
      request.error = error;
      request.status = 500; // Internal Server Error
    } finally {
      if (request.method != "HEAD" && request.status > 299) { // return an error page
        request.responseText = this.interpret(request);
      }
      request.readyState = 4; // Loaded
    }
  }
}, {
  GET: function(server, request) {
    // get header info, really just makes sure the file exists
    this.HEAD(server, request);
    if (request.status == 200) { // file exists
      switch (request.headers["Content-Type"]) {
        case "text/plain":
          request.responseText = server.io.read(request.url);
          break;
        default:
          request.responseText = server.interpret(request);
      }
    }
  },
  
  HEAD: function(server, request) {
    var url = request.url.replace(/!.*$/, "");
    if (server.io.exists(url)) {
      var DIR = /\/$/;
      if (server.io.isDirectory(url) && !DIR.test(url)) {
        request.headers["Location"] = url + "/";
        request.status = 301; // Moved Permanently
      } else {
        request.status = 200; // OK
      }
    } else {
      request.status = 404; // Not Found
    }
  },
  
  OPTIONS: function(server, request) {
    var options = "GET,HEAD,OPTIONS,PUT,DELETE".split(",");
    // don't support PUT/DELETE unless we are using the file: prototcol
    if (!/^file:/.test(location.protocol)) {
      options = options.slice(0, -2);
    }
    request.headers["Allow"] = options.join(",");
    request.status = 200; // OK
  },
  
  PUT: function(server, request, data) {
    request.responseText = server.io.write(request.url, data);
    // not sure what to return here
    request.status = 200; // OK
  },
  
  DELETE: function(server, request) {
    this.HEAD(server, request);
    // not sure what to return here
    if (request.status == 200) {
      request.reponseText = server.io.remove(request.url);
    }
  },
  
  POST: function(server, request, data) {
    // build a simple object containing post data
    forEach (data.split("&"), function(data) {
      data = data.split("=");
      request.post[data[0]] = decodeURIComponent(data[1]);
    });
    // same as GET apart from post data
    this.GET(server, request);
  }
});

// =========================================================================
// MiniWeb/Request.js
// =========================================================================

// We are basically mimicking the XMLHttpRequest object

var Request = Base.extend({
  constructor: function(method, url, data, headers) {
    this.headers = {};
    // allow quick open+send from the constructor if arguments are supplied
    if (arguments.length > 0) {
      this.open(method, url);
      for (var i in headers) {
        this.setRequestHeader(i, headers[i]);
      }
      this.send(data);
    }
  },
  
  headers: null,
  readyState: 0,
  status: 0,
//-  statusText: "",  // don't bother with this one
  method: "",
  responseText: "",
  url: "",
  
  open: function(method, url) {
    assert(this.readyState == 0, "Invalid state.");
    this.readyState = 1;
    this.method = method;
    this.url = url;
  },
  
  send: function(data) {
    assert(this.readyState == 1, "Invalid state.");
    this.readyState = 2;
    MiniWeb.send(this, data);
  },
  
  // there is no distinction between request/response headers at the moment
  
  getResponseHeader: function(header) {
    assert(this.readyState >= 3, "Invalid state.");
    return this.headers[header];
  },
  
  setRequestHeader: function(header, value) {
    assert(this.readyState == 1, "Invalid state.");
    this.headers[header] = value;
  }
});

// =========================================================================
// MiniWeb/FileSystem.js
// =========================================================================

// This class wraps the various file retrieval systems.
// So far they are:
//   JSON (json:)
//   Local file system (file:)

var FileSystem = JSONFileSystem.extend({
  constructor: function() {
    this.base(MiniWeb.$$);
  },
  
  remove: function(path) {
    MiniWeb.dirty = true;
    return this.base(path);
  },
  
  write: function(path, data) {
    MiniWeb.dirty = true;
    return this.base(path, data);
  },
  
  protocol: "json:"
});

// =========================================================================
// MiniWeb/Command.js
// =========================================================================

// This is the base command object for the MiniWeb interpreter.
//  This object effectively defines the templating language.
//  It extends FileSystem so has inherent commands for IO.

var Command = FileSystem.extend({
  constructor: function() {
    this.base();
    var command = this;
    var jst = new JST.Interpreter(this);
    this[Command.INCLUDES] = {};
    this.exec = function(template, target) {
      command.parent = command.self;
      if (!command.top) {
        command.top = 
        command.parent = this.makepath(template);
      }
      var path = command.path;
      var restore = command.target;
      command.self = this.makepath(template);
      command.chdir(template);
      command.target = target || "";
      var result = jst.interpret(this.read(template));
      command.target = restore;
      command.path = path;
      command.self = command.parent;
      return result;
    };
  },
  
  parent: "",
  self: "",
  target: "",
  top: "",
  
  args: function(names) {
    // define template arguments in the current scope
    var args = this.target.split(/\s+/);
    forEach (String(names).match(/[^\s,]+/g), function(name, index) {
      if (name) this[name] = args[index];
    }, this);
    return args;
  },
  
  escapeHTML: function(string) {
    return Command.HTML_ESCAPE.exec(string);
  },
  
  exec: Undefined, // defined in the constructor function
  
  include: function(template) {
    this.echo(this.exec(template, this.target));
  },
  
  include_once: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path]) {
      this[Command.INCLUDES][path] = true;
      this.include(template);
    }
  },
  
  process: function(template, target) {
    var WILD_CARD = /\*$/;
    if (WILD_CARD.test(target)) { // process everything in the current directory
      var path = target.replace(WILD_CARD, "") || this.path;
      var directory = this.read(path);
      forEach (directory, function(item, target) {
        if (!item.isDirectory) {
          this.process(template, target);
        }
      }, this);
    } else {
      this.echo(this.exec(template, target));
    }
    // process remaining arguments
    forEach (slice(arguments, 2), function(target) {
      this.process(template, target);
    }, this);
  }
}, {
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
  INCLUDES: 3,
  
  HTML_ESCAPE: new RegGrp({
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#39;",
    "<": "&lt;",
    ">": "&gt;"
  })
});

// =========================================================================
// MiniWeb/Interpreter.js
// =========================================================================

// This object gets between the server and the file system to manage the
//  returned content.
// The interpreter also provides access to to a copy of the request object 
//  and its post data.

// this is still in a state of flux until I can finalise the templating system.

var Interpreter = Command.extend({
  constructor: function(request) {
    this.base();
    this.request = JSON.copy(request);
  },
  
  query: "",
  request: null,

  include_script: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path] && !Interpreter.SYSTEM.test(this.top)) {
      this.echo("<script type='text/javascript'>\n");
      this.include_once(template);
      this.echo("\n<\/script>\n");
    }
  },

  include_style: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path] && !Interpreter.SYSTEM.test(this.top)) {
      this.echo("<style type='text/css'>\n");
      this.include_once(template);
      this.echo("\n<\/style>\n");
    }
  },
  
  interpret: function() {
    var url = this.request.url;
    var template = Interpreter.VIEW;
    var status = this.request.status;
    
    if (status > 299) { // return an error page
      target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
    } else {
      if (url.indexOf("!") != -1) { // it's a query
        var parts = url.split("!");
        url = parts[0];
        this.query = parts[1];
      }
      var target = url;
      // find a template
      var path = url.split("/");
      do {
        path.pop();
        template = path.join("/") + Interpreter.VIEW;
      } while (path.length && !this.exists(template));
      if (this.isDirectory(target) && this.exists(target + Interpreter.DEFAULT)) {
        target += Interpreter.DEFAULT;
      }
    }
    return this.exec(template, target);
  }
}, {
  DEFAULT:   "default",
  SYSTEM:    /^\/system\/(create|edit|view)$/,
  VIEW:      "/system/view",
  ERROR:     "/system/Error/",
  ERROR_PAGES: {
    "301": "Moved_Permanently",
    "404": "Not_Found",
    "405": "Method_Not_Allowed",
    "500": "Internal_Server_Error"
  }
});

// =========================================================================
// MiniWeb/Terminal.js
// =========================================================================

// It didn't start off that way but this is becoming more like the UNIX shell
//  (which I know very little about)

var Terminal = Command.extend({
  constructor: function() {
    this.base();
    Terminal.load(this);
    this.extend("exec", function() {
      try {
        return base(this, arguments);
      } catch (error) {
        return String(error.message || error);
      }
    });
  }
}, {
  STATE: "#state",
  TMP:   "~terminal",
  
  load: function(terminal) {
    // the state of a terminal session is saved to disk whenever
    //  MiniWeb is saved from the terminal. Reload the saved
    //  state.
    if (!MiniWeb.readOnly && LocalFile.exists(this.TMP)) {
      var state = JSON.parse(LocalFile.read(this.TMP));
      LocalFile.remove(this.TMP);
    } else {
      state = {
        commands: [],
        output:   "<pre>" + MiniWeb + "</pre><br>",
        path:     "/",
        position: 0,
        protocol: "json:"
      };
    }
    terminal.protocol = state.protocol;
    terminal.path = state.path;
    terminal[this.STATE] = state;
  },
  
  save: function(terminal) {
    // save the state of a terminal session to disk
    var state = terminal[this.STATE];
    state.protocol = terminal.protocol;
    state.path = terminal.path;
    if (!MiniWeb.readOnly) {
      LocalFile.write(this.TMP, JSON.toString(state));
    }
  }
});

// =========================================================================
// MiniWeb/HTMLElement.js
// =========================================================================

// This is here in place of the real HTMLElement class.
// We only need the serialize method of the HTMLFormElement class
//  so we can ignore the rest.

var HTMLElement = Module.extend();

// =========================================================================
// MiniWeb/~/base2/DOM/html/HTMLFormElement.js
// =========================================================================

var HTMLFormElement = HTMLElement.extend({
  serialize: function(form) {
    return filter(form.elements, HTMLFormItem.isSuccessful).map(HTMLFormItem.serialize).join("&");
  }
}, {
  tags: "FORM"
});

// =========================================================================
// MiniWeb/~/base2/DOM/html/HTMLFormItem.js
// =========================================================================

var HTMLFormItem = HTMLElement.extend(null, {
  tags: "BUTTON,INPUT,SELECT,TEXTAREA",
  
  isSuccessful: function(item) {
    if (!item.name || item.disabled) return false;
    switch (item.type) {
      case "button":
      case "reset":
        return false;
      case "radio":
      case "checkbox":
        return item.checked;
      case "image":
      case "submit":
        return item == Traversal.getOwnerDocument(item).activeElement;
      default:
        return true;
    }
  },
  
  serialize: function(item) {
    return item.name + "=" + encodeURIComponent(item.value);
  }
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
