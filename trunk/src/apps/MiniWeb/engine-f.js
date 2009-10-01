/*
  base2 - copyright 2007-2009, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php

  Contributors:
    Doeke Zanstra
*/

// timestamp: Thu, 01 Oct 2009 14:12:38

var base2 = {
  name:    "base2",
  version: "1.1 (alpha3)",
  exports:
    "Base,Package,Abstract,Module,Enumerable,Map,Collection,RegGrp," +
    "I,II,K,Undefined,Null,This,True,False,assignID,detect,global",
  namespace: ""
};

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// base2/header.js
// =========================================================================

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

// =========================================================================
// base2/Base.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/03/base/

var _subclass = function(_instance, _static) {
  // Build the prototype.
  base2.__prototyping = this.prototype;
  var _prototype = new this;
  if (_instance) extend(_prototype, _instance);
  _prototype.base = function() {
    // call this method from any other method to invoke that method's ancestor
  };
  delete base2.__prototyping;
  
  // Create the wrapper for the constructor function.
  var _constructor = _prototype.constructor;
  function _class() {
    // Don't call the constructor function when prototyping.
    if (!base2.__prototyping) {
      if (this.constructor == _class || this.__constructing) {
        // Instantiation.
        this.__constructing = true;
        _constructor.apply(this, arguments);
        delete this.__constructing;
      } else {
        // Casting.
        return extend(arguments[0], _prototype);
      }
    }
    return this;
  };
  _prototype.constructor = _class;
  
  // Build the static interface.
  for (var i in Base) _class[i] = this[i];
  if (_static) extend(_class, _static);
  _class.ancestor = this;
  _class.ancestorOf = Base.ancestorOf;
  _class.base = _prototype.base;
  _class.prototype = _prototype;
  if (_class.init) _class.init();
  
  // introspection (removed when packed)
  ;;; _class["#implements"] = [];
  ;;; _class["#implemented_by"] = [];
  
  return _class;
};

var Base = _subclass.call(Object, {
  constructor: function() {
    if (arguments.length > 0) {
      this.extend(arguments[0]);
    }
  },
  
  extend: delegate(extend),
  
  toString: function() {
    if (this.constructor.toString == Function.prototype.toString) {
      return "[object base2.Base]";
    } else {
      return "[object " + String2.slice(this.constructor, 1, -1) + "]";
    }
  }
}, Base = {
  ancestorOf: function(klass) {
    return _ancestorOf(this, klass);
  },

  extend: _subclass,

  forEach: function(object, block, context) {
    _Function_forEach(this, object, block, context);
  },

  implement: function(source) {
    if (typeof source == "function") {
      ;;; if (_ancestorOf(Base, source)) {
        // introspection (removed when packed)
        ;;; this["#implements"].push(source);
        ;;; source["#implemented_by"].push(this);
      ;;; }
      source = source.prototype;
    }
    // Add the interface using the extend() function.
    extend(this.prototype, source);
    return this;
  }
});

// =========================================================================
// base2/Package.js
// =========================================================================

var Package = Base.extend({
  constructor: function(_private, _public) {
    var pkg = this;
    
    pkg.extend(_public);

    if (pkg.name && pkg.name != "base2") {
      if (_public.parent === undefined) pkg.parent = base2;
      if (pkg.parent) pkg.parent.addName(pkg.name, pkg);
      pkg.namespace = format("var %1=%2;", pkg.name, String2.slice(pkg, 1, -1));
    }
    
    if (_private) {
      // This next line gets round a bug in old Mozilla browsers
      var jsNamespace = base2.js ? base2.js.namespace : "";
      
      // This string should be evaluated immediately after creating a Package object.
      var namespace = "var base2=(function(){return this.base2})(),_private=base2.toString;" + base2.namespace + jsNamespace;
      var imports = csv(pkg.imports), name;
      for (var i = 0; name = imports[i]; i++) {
        var ns = lookup(name) || lookup("js." + name);
        if (!ns) throw new ReferenceError(format("Object not found: '%1'.", name));
        namespace += ns.namespace;
      }
      _private.init = function() {
        if (pkg.init) pkg.init();
      };
      _private.imports = namespace + lang.namespace + "this.init();";
      
      // This string should be evaluated after you have created all of the objects
      // that are being exported.
      namespace = "";
      var exports = csv(pkg.exports);
      for (var i = 0; name = exports[i]; i++) {
        var fullName = pkg.name + "." + name;
        pkg.namespace += "var " + name + "=" + fullName + ";";
        namespace += "if(!" + fullName + ")" + fullName + "=" + name + ";";
      }
      _private.exports = namespace + "this._label_" + pkg.name + "();";
      
      // give objects and classes pretty toString methods
      var packageName = String2.slice(pkg, 1, -1);
      _private["_label_" + pkg.name] = function() {
        for (var name in pkg) {
          var object = pkg[name];
          if (object && object.ancestorOf == Base.ancestorOf && name != "constructor") { // it's a class
            object.toString = K("[" + packageName + "." + name + "]");
          }
        }
      };
    }

    function lookup(names) {
      names = names.split(".");
      var value = base2, i = 0;
      while (value && names[i] != null) {
        value = value[names[i++]];
      }
      return value;
    };
  },

  exports: "",
  imports: "",
  name: "",
  namespace: "",
  parent: null,

  addName: function(name, value) {
    if (!this[name]) {
      this[name] = value;
      this.exports += "," + name;
      this.namespace += format("var %1=%2.%1;", name, this.name);
      if (value && value.ancestorOf == Base.ancestorOf && name != "constructor") { // it's a class
        value.toString = K("[" + String2.slice(this, 1, -1) + "." + name + "]");
      }
    }
  },

  addPackage: function(name) {
    this.addName(name, new Package(null, {name: name, parent: this}));
  },
  
  toString: function() {
    return format("[%1]", this.parent ? String2.slice(this.parent, 1, -1) + "." + this.name : this.name);
  }
});

// =========================================================================
// base2/Abstract.js
// =========================================================================

// Not very exciting this.

var Abstract = Base.extend({
  constructor: function() {
    throw new TypeError("Abstract class cannot be instantiated.");
  }
});

// =========================================================================
// base2/Module.js
// =========================================================================

var _moduleCount = 0;

var Module = Abstract.extend(null, {
  namespace: "",

  extend: function(_interface, _static) {
    // Extend a module to create a new module.
    var module = this.base();
    var index = _moduleCount++;
    module.namespace = "";
    module.partial = this.partial;
    module.toString = K("[base2.Module[" + index + "]]");
    Module[index] = module;
    // Inherit class methods.
    module.implement(this);
    // Implement module (instance AND static) methods.
    if (_interface) module.implement(_interface);
    // Implement static properties and methods.
    if (_static) {
      extend(module, _static);
      if (module.init) module.init();
    }
    return module;
  },

  forEach: function(block, context) {
    _Function_forEach (Module, this.prototype, function(method, name) {
      if (typeOf(method) == "function") {
        block.call(context, this[name], name, this);
      }
    }, this);
  },

  implement: function(_interface) {
    var module = this;
    var id = module.toString().slice(1, -1);
    if (typeof _interface == "function") {
      if (!_ancestorOf(_interface, module)) {
        this.base(_interface);
      }
      if (_ancestorOf(Module, _interface)) {
        // Implement static methods.
        for (var name in _interface) {
          if (typeof module[name] == "undefined") {
            var property = _interface[name];
            if (typeof property == "function" && property.call && _interface.prototype[name]) {
              property = _createStaticModuleMethod(_interface, name);
            }
            module[name] = property;
          }
        }
        module.namespace += _interface.namespace.replace(/base2\.Module\[\d+\]/g, id);
      }
    } else {
      // Add static interface.
      extend(module, _interface);
      // Add instance interface.
      _extendModule(module, _interface);
    }
    return module;
  },

  partial: function() {
    var module = Module.extend();
    var id = module.toString().slice(1, -1);
    // partial methods are already bound so remove the binding to speed things up
    module.namespace = this.namespace.replace(/(\w+)=b[^\)]+\)/g, "$1=" + id + ".$1");
    this.forEach(function(method, name) {
      module[name] = partial(bind(method, module));
    });
    return module;
  }
});


Module.prototype.base =
Module.prototype.extend = _IGNORE;

function _extendModule(module, _interface) {
  var proto = module.prototype;
  var id = module.toString().slice(1, -1);
  for (var name in _interface) {
    var property = _interface[name], namespace = "";
    if (name.indexOf("@") == 0) { // object detection
      if (detect(name.slice(1))) _extendModule(module, property);
    } else if (!proto[name]) {
      if (name == name.toUpperCase()) {
        namespace = "var " + name + "=" + id + "." + name + ";";
      } else if (typeof property == "function" && property.call) {
        namespace = "var " + name + "=base2.lang.bind('" + name + "'," + id + ");";
        proto[name] = _createModuleMethod(module, name);
        ;;; proto[name]._module = module; // introspection
      }
      if (module.namespace.indexOf(namespace) == -1) {
        module.namespace += namespace;
      }
    }
  }
};

function _createStaticModuleMethod(module, name) {
  return function() {
    return module[name].apply(module, arguments);
  };
};

function _createModuleMethod(module, name) {
  return function() {
    var args = _slice.call(arguments);
    args.unshift(this);
    return module[name].apply(module, args);
  };
};

// =========================================================================
// base2/Enumerable.js
// =========================================================================

var Enumerable = Module.extend({
  every: function(object, test, context) {
    var result = true;
    try {
      forEach (object, function(value, key) {
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
    var args = _slice.call(arguments, 2);
    return this.map(object, typeof method == "function" ? function(item) {
      return item == null ? undefined : method.apply(item, args);
    } : function(item) {
      return item == null ? undefined : item[method].apply(item, args);
    });
  },
  
  map: function(object, block, context) {
    var result = [], i = 0;
    forEach (object, function(value, key) {
      result[i++] = block.call(context, value, key, object);
    });
    return result;
  },
  
  pluck: function(object, key) {
    return this.map(object, function(item) {
      return item == null ? undefined : item[key];
    });
  },
  
  reduce: function(object, block, result, context) {
    var initialised = arguments.length > 2;
    forEach (object, function(value, key) {
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
});

// =========================================================================
// base2/Map.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:dictionary

var _HASH = "#";

var Map = Base.extend({
  constructor: function(values) {
    if (values) this.merge(values);
  },

  clear: function() {
    for (var key in this) if (key.indexOf(_HASH) == 0) {
      delete this[key];
    }
  },

  copy: function() {
    base2.__prototyping = true; // not really prototyping but it stops [[construct]] being called
    var copy = new this.constructor;
    delete base2.__prototyping;
    for (var i in this) if (this[i] !== copy[i]) {
      copy[i] = this[i];
    }
    return copy;
  },

  forEach: function(block, context) {
    for (var key in this) if (key.indexOf(_HASH) == 0) {
      block.call(context, this[key], key.slice(1), this);
    }
  },

  get: function(key) {
    return this[_HASH + key];
  },

  getKeys: function() {
    return this.map(II);
  },

  getValues: function() {
    return this.map(I);
  },

  // Ancient browsers throw an error if we use "in" as an operator.
  has: function(key) {
    key = _HASH + key;
    /*@if (@_jscript_version < 5.5)
      return this[key] !== undefined || $Legacy.has(this, key);
    @else @*/
      return key in this;
    /*@end @*/
  },

  merge: function(values /*, value1, value2, .. ,valueN */) {
    var put = flip(this.put);
    forEach (arguments, function(values) {
      forEach (values, put, this);
    }, this);
    return this;
  },

  put: function(key, value) {
    // create the new entry (or overwrite the old entry).
    this[_HASH + key] = value;
    return value;
  },

  remove: function(key) {
    delete this[_HASH + key];
  },

  size: function() {
    // this is expensive because we are not storing the keys
    var size = 0;
    for (var key in this) if (key.indexOf(_HASH) == 0) size++;
    return size;
  },

  union: function(values) {
    return this.merge.apply(this.copy(), arguments);
  }
});

Map.implement(Enumerable);

Map.prototype.filter = function(test, context) {
  return this.reduce(function(result, value, key) {
    if (!test.call(context, value, key, this)) {
      result.remove(key);
    }
    return result;
  }, this.copy(), this);
};

// =========================================================================
// base2/Collection.js
// =========================================================================

// A Map that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, put, insertAt, putAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var _KEYS = "~";

var Collection = Map.extend({
  constructor: function(values) {
    this[_KEYS] = new Array2;
    this.base(values);
  },
  
  add: function(key, item) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    if (this.has(key)) throw "Duplicate key '" + key + "'.";
    return this.put.apply(this, arguments);
  },

  clear: function() {
    this.base();
    this[_KEYS].length = 0;
  },

  copy: function() {
    var copy = this.base();
    copy[_KEYS] = this[_KEYS].copy();
    return copy;
  },

  forEach: function(block, context) {
    var keys = this[_KEYS].concat();
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      block.call(context, this[_HASH + keys[i]], keys[i], this);
    }
  },

  getAt: function(index) {
    var key = this[_KEYS].item(index);
    return (key === undefined)  ? undefined : this[_HASH + key];
  },

  getKeys: function() {
    return this[_KEYS].copy();
  },

  indexOf: function(key) {
    return this[_KEYS].indexOf(String(key));
  },

  insertAt: function(index, key, item) {
    if (this[_KEYS].item(index) == null) throw "Index out of bounds.";
    if (this.has(key)) throw "Duplicate key '" + key + "'.";
    this[_KEYS].insertAt(index, String(key));
    this[_HASH + key] = null; // placeholder
    return this.put.apply(this, _slice.call(arguments, 1));
  },

  item: function(keyOrIndex) {
    return this[typeof keyOrIndex == "number" ? "getAt" : "get"](keyOrIndex);
  },

  put: function(key, item) {
    var klass = this.constructor;
    if (klass.Item && !instanceOf(item, klass.Item)) {
      item = klass.create.apply(klass, arguments);
    }
    if (!this.has(key)) {
      this[_KEYS].push(String(key));
    }
    this[_HASH + key] = item;
    return item;
  },

  putAt: function(index, item) {
    arguments[0] = this[_KEYS].item(index);
    if (arguments[0] == null) throw "Index out of bounds.";
    return this.put.apply(this, arguments);
  },

  remove: function(key) {
    // The remove() method of the Array object can be slow so check if the key exists first.
    if (this.has(key)) {
      this[_KEYS].remove(String(key));
      delete this[_HASH + key];
    }
  },

  removeAt: function(index) {
    var key = this[_KEYS].item(index);
    if (key !== undefined) {
      this[_KEYS].removeAt(index);
      delete this[_HASH + key];
    }
  },

  reverse: function() {
    this[_KEYS].reverse();
    return this;
  },

  size: function() {
    return this[_KEYS].length;
  },

  slice: function(start, end) {
    var sliced = this.copy();
    if (arguments.length > 0) {
      var keys = this[_KEYS], removed = keys;
      sliced[_KEYS] = Array2(_slice.apply(keys, arguments));
      if (sliced[_KEYS].length) {
        removed = removed.slice(0, start);
        if (arguments.length > 1) {
          removed = removed.concat(keys.slice(end));
        }
      }
      for (var i = 0; i < removed.length; i++) {
        delete sliced[_HASH + removed[i]];
      }
    }
    return sliced;
  },

  sort: function(compare) { // optimised (refers to _HASH)
    if (compare) {
      this[_KEYS].sort(bind(function(key1, key2) {
        return compare(this[_HASH + key1], this[_HASH + key2], key1, key2);
      }, this));
    } else this[_KEYS].sort();
    return this;
  },

  toString: function() {
    return "(" + (this[_KEYS] || "") + ")";
  }
}, {
  Item: null, // If specified, all members of the collection must be instances of Item.
  
  create: function(key, item) {
    return this.Item ? new this.Item(key, item) : item;
  },
  
  extend: function(_instance, _static) {
    var klass = this.base(_instance);
    klass.create = this.create;
    if (_static) extend(klass, _static);
    if (!klass.Item) {
      klass.Item = this.Item;
    } else if (typeof klass.Item != "function") {
      klass.Item = (this.Item || Base).extend(klass.Item);
    }
    if (klass.init) klass.init();
    return klass;
  }
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var _RG_BACK_REF        = /\\(\d+)/g,
    _RG_ESCAPE_CHARS    = /\\./g,
    _RG_ESCAPE_BRACKETS = /\(\?[:=!]|\[[^\]]+\]/g,
    _RG_BRACKETS        = /\(/g,
    _RG_LOOKUP          = /\$(\d+)/,
    _RG_LOOKUP_SIMPLE   = /^\$\d+$/;

var RegGrp = Collection.extend({
  constructor: function(values, ignoreCase) {
    this.base(values);
    this.ignoreCase = !!ignoreCase;
  },

  ignoreCase: false,

  exec: function(string, override) { // optimised (refers to _HASH/_KEYS)
    string += ""; // type-safe
    var items = this, keys = this[_KEYS];
    if (!keys.length) return string;
    if (override == RegGrp.IGNORE) override = 0;
    return string.replace(new RegExp(this, this.ignoreCase ? "gi" : "g"), function(match) {
      var item, offset = 1, i = 0;
      // Loop through the RegGrp items.
      while ((item = items[_HASH + keys[i++]])) {
        var next = offset + item.length + 1;
        if (arguments[offset]) { // do we have a result?
          var replacement = override == null ? item.replacement : override;
          switch (typeof replacement) {
            case "function":
              return replacement.apply(items, _slice.call(arguments, offset, next));
            case "number":
              return arguments[offset + replacement];
            default:
              return replacement;
          }
        }
        offset = next;
      }
      return match;
    });
  },

  insertAt: function(index, expression, replacement) {
    if (instanceOf(expression, RegExp)) {
      arguments[1] = expression.source;
    }
    return this.base.apply(this, arguments);
  },

  test: function(string) {
    // The slow way to do it. Hopefully, this isn't called too often. :-)
    return this.exec(string) != string;
  },
  
  toString: function() {
    var offset = 1;
    return "(" + this.map(function(item) {
      // Fix back references.
      var expression = (item + "").replace(_RG_BACK_REF, function(match, index) {
        return "\\" + (offset + Number(index));
      });
      offset += item.length + 1;
      return expression;
    }).join(")|(") + ")";
  }
}, {
  IGNORE: "$0",
  
  init: function() {
    forEach ("add,get,has,put,remove".split(","), function(name) {
      this[name] = _override(this, name, function(expression) {
        if (instanceOf(expression, RegExp)) {
          arguments[0] = expression.source;
        }
        return this.base.apply(this, arguments);
      });
    }, this.prototype);
  },
  
  Item: {
    constructor: function(expression, replacement) {
      if (replacement == null) replacement = RegGrp.IGNORE;
      else if (replacement.replacement != null) replacement = replacement.replacement;
      else if (typeof replacement != "function") replacement = String(replacement);
      
      // does the pattern use sub-expressions?
      if (typeof replacement == "string" && _RG_LOOKUP.test(replacement)) {
        // a simple lookup? (e.g. "$2")
        if (_RG_LOOKUP_SIMPLE.test(replacement)) {
          // store the index (used for fast retrieval of matched strings)
          replacement = parseInt(replacement.slice(1), 10);
        } else { // a complicated lookup (e.g. "Hello $2 $1")
          // build a function to do the lookup
          // Improved version by Alexei Gorkov:
          var Q = '"';
          replacement = replacement
            .replace(/\\/g, "\\\\")
            .replace(/"/g, "\\x22")
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\$(\d+)/g, Q + "+(arguments[$1]||" + Q+Q + ")+" + Q)
            .replace(/(['"])\1\+(.*)\+\1\1$/, "$1");
          replacement = new Function("return " + Q + replacement + Q);
        }
      }
      
      this.length = RegGrp.count(expression);
      this.replacement = replacement;
      this.toString = K(expression + "");
    },

    disabled: false,
    length: 0,
    replacement: ""
  },
  
  count: function(expression) {
    // Count the number of sub-expressions in a RegExp/RegGrp.Item.
    expression = (expression + "").replace(_RG_ESCAPE_CHARS, "").replace(_RG_ESCAPE_BRACKETS, "");
    return match(expression, _RG_BRACKETS).length;
  }
});

// =========================================================================
// lang/package.js
// =========================================================================

var lang = {
  name:      "lang",
  version:   base2.version,
  exports:   "assert,assertArity,assertType,bind,copy,extend,forEach,format,instanceOf,match,pcopy,rescape,trim,typeOf",
  namespace: "" // Fixed later.
};

// =========================================================================
// lang/assert.js
// =========================================================================

function assert(condition, message, ErrorClass) {
  if (!condition) {
    throw new (ErrorClass || Error)(message || "Assertion failed.");
  }
};

function assertArity(args, arity, message) {
  if (arity == null) arity = args.callee.length; //-@DRE
  if (args.length < arity) {
    throw new SyntaxError(message || "Not enough arguments.");
  }
};

function assertType(object, type, message) {
  if (type && (typeof type == "function" ? !instanceOf(object, type) : typeOf(object) != type)) {
    throw new TypeError(message || "Invalid type.");
  }
};

// =========================================================================
// lang/copy.js
// =========================================================================

function copy(object) { // A quick copy.
  var copy = {};
  for (var i in object) {
    copy[i] = object[i];
  }
  return copy;
};

function pcopy(object) { // Prototype-base copy.
  // Doug Crockford / Richard Cornford
  _dummy.prototype = object;
  return new _dummy;
};

function _dummy(){};

// =========================================================================
// lang/extend.js
// =========================================================================

function extend(object, source) { // or extend(object, key, value)
  if (object && source) {
    var useProto = base2.__prototyping;
    if (arguments.length > 2) { // Extending with a key/value pair.
      var key = source;
      source = {};
      source[key] = arguments[2];
      useProto = true;
    }
    //var proto = (typeof source == "function" ? Function : Object).prototype;
    var proto = global[(typeof source == "function" ? "Function" : "Object")].prototype;
    // Add constructor, toString etc
    if (useProto) {
      var i = _HIDDEN.length, key;
      while ((key = _HIDDEN[--i])) {
        var value = source[key];
        if (value != proto[key]) {
          if (_BASE.test(value)) {
            object[key] = _override(object, key, value);
          } else {
            object[key] = value;
          }
        }
      }
    }
    // Copy each of the source object's properties to the target object.
    for (key in source) {
      if (typeof proto[key] == "undefined") {
        value = source[key];
        // Object detection.
        if (key.indexOf("@") == 0) {
          if (detect(key.slice(1))) extend(object, value);
        } else if (value != _IGNORE) {
          // Check for method overriding.
          var ancestor = object[key];
          if (ancestor && typeof value == "function") {
            if (value != ancestor) {
              if (_BASE.test(value)) {
                object[key] = _override(object, key, value);
              } else {
                value.ancestor = ancestor;
                object[key] = value;
              }
            }
          } else {
            object[key] = value;
          }
        }
      }
    }
  }
  // http://www.hedgerwow.com/360/dhtml/ie6_memory_leak_fix/
  /*@if (@_jscript) {
    try {
      return object;
    } finally {
      object = null;
    }
  }
  @else @*/
    return object;
  /*@end @*/
};

function _ancestorOf(ancestor, fn) {
  // Check if a function is in another function's inheritance chain.
  while (fn) {
    if (!fn.ancestor) return false;
    fn = fn.ancestor;
    if (fn == ancestor) return true;
  }
  return false;
};

function _override(object, name, method) {
  // Return a method that overrides an existing method.
  var ancestor = object[name];
  var superObject = base2.__prototyping; // late binding for prototypes
  if (superObject && ancestor != superObject[name]) superObject = null;
  function _base() {
    var previous = this.base;
    this.base = superObject ? superObject[name] : ancestor;
    var returnValue = method.apply(this, arguments);
    this.base = previous;
    return returnValue;
  };
  _base.method = method;
  _base.ancestor = ancestor;
  // introspection (removed when packed)
  ;;; _base.toString = K(method + "");
  return _base;
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
    if (typeof object == "function" && object.call) {
      // Functions are a special case.
      fn = Function;
    } else if (typeof object.forEach == "function" && object.forEach != forEach) {
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

forEach.csv = function(string, block, context) {
  forEach (csv(string), block, context);
};

forEach.detect = function(object, block, context) {
  var filter = function(value, key) {
    if (key.indexOf("@") == 0) { // object detection
      if (detect(key.slice(1))) forEach (value, filter);
    } else block.call(context, value, key, object);
  };
  forEach (object, filter);
};

// These are the two core enumeration methods. All other forEach methods
//  eventually call one of these two.

function _Array_forEach(array, block, context) {
  if (array == null) array = global;
  var length = array.length || 0, i; // preserve length
  if (typeof array == "string") {
    for (i = 0; i < length; i++) {
      block.call(context, array.charAt(i), i, array);
    }
  } else { // Cater for sparse arrays.
    for (i = 0; i < length; i++) {
    /*@if (@_jscript_version < 5.2)
      if (array[i] !== undefined && $Legacy.has(array, i))
    @else @*/
      if (i in array)
    /*@end @*/
        block.call(context, array[i], i, array);
    }
  }
};

function _Function_forEach(fn, object, block, context) {
  // http://code.google.com/p/base2/issues/detail?id=10

  // Run the test for Safari's buggy enumeration.
  var Temp = function(){this.i=1};
  Temp.prototype = {i:1};
  var count = 0;
  for (var i in new Temp) count++;

  // Overwrite the main function the first time it is called.
  _Function_forEach = count > 1 ? function(fn, object, block, context) {
    // Safari fix (pre version 3)
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
      if (typeof fn.prototype[key] == "undefined") {
        block.call(context, object[key], key, object);
      }
    }
  };

  _Function_forEach(fn, object, block, context);
};

// =========================================================================
// lang/instanceOf.js
// =========================================================================

function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).
  
  if (typeof klass != "function") {
    throw new TypeError("Invalid 'instanceOf' operand.");
  }

  if (object == null) return false;
   
  // COM objects don't have a constructor
  /*@if (@_jscript)
    if (typeof object.constructor != "function") {
      return klass == Object;
    }
  /*@end @*/
  if (object.constructor == klass) return true;
  if (klass.ancestorOf) return klass.ancestorOf(object.constructor);
  /*@if (@_jscript_version < 5.1)
    // do nothing
  @else @*/
    if (object instanceof klass) return true;
  /*@end @*/

  // If the class is a base2 class then it would have passed the test above.
  if (Base.ancestorOf == klass.ancestorOf) return false;
  
  // base2 objects can only be instances of Object.
  if (Base.ancestorOf == object.constructor.ancestorOf) return klass == Object;
  
  switch (klass) {
    case Array:
      return _toString.call(object) == "[object Array]";
    case Date:
      return _toString.call(object) == "[object Date]";
    case RegExp:
      return _toString.call(object) == "[object RegExp]";
    case Function:
      return typeOf(object) == "function";
    case String:
    case Number:
    case Boolean:
      return typeOf(object) == typeof klass.prototype.valueOf();
    case Object:
      return true;
  }
  
  return false;
};

var _toString = Object.prototype.toString;

// =========================================================================
// lang/typeOf.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:typeof

function typeOf(object) {
  var type = typeof object;
  switch (type) {
    case "object":
      return object == null
        ? "null"
        : typeof object.constructor != "function" // COM object
          ? _MSIE_NATIVE_FUNCTION.test(object)
            ? "function"
            : type
          : _toString.call(object) == "[object Date]"
            ? type
            : typeof object.constructor.prototype.valueOf(); // underlying type
    case "function":
      return typeof object.call == "function" ? type : "object";
    default:
      return type;
  }
};

// =========================================================================
// js/package.js
// =========================================================================

var js = {
  name:      "js",
  version:   base2.version,
  exports:   "Array2,Date2,Function2,String2",
  namespace: "", // fixed later
  
  bind: function(host) {
    var top = global;
    global = host;
    forEach.csv(this.exports, function(name2) {
      var name = name2.slice(0, -1);
      extend(host[name], this[name2]);
      this[name2](host[name].prototype); // cast
    }, this);
    global = top;
    return host;
  }
};

function _createObject2(Native, constructor, generics, extensions) {
  // Clone native objects and extend them.

  // Create a Module that will contain all the new methods.
  var INative = Module.extend();
  var id = INative.toString().slice(1, -1);
  // http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
  forEach.csv(generics, function(name) {
    INative[name] = unbind(Native.prototype[name]);
    INative.namespace += format("var %1=%2.%1;", name, id);
  });
  forEach (_slice.call(arguments, 3), INative.implement, INative);

  // create a faux constructor that augments the native object
  var Native2 = function() {
    return INative(this.constructor == INative ? constructor.apply(null, arguments) : arguments[0]);
  };
  Native2.prototype = INative.prototype;

  // Remove methods that are already implemented.
  for (var name in INative) {
    var method = Native[name];
    if (method && name != "prototype" && name != "toString" && method != Function.prototype[name]) {
      INative[name] = method;
      delete INative.prototype[name];
    }
    Native2[name] = INative[name];
  }
  Native2.ancestor = Object;
  delete Native2.extend;
  
  // remove "lang.bind.."
  Native2.namespace = Native2.namespace.replace(/(var (\w+)=)[^,;]+,([^\)]+)\)/g, "$1$3.$2");
  
  return Native2;
};

// =========================================================================
// js/~/Date.js
// =========================================================================

// Fix Date.get/setYear() (IE5-7)

if ((new Date).getYear() > 1900) {
  Date.prototype.getYear = function() {
    return this.getFullYear() - 1900;
  };
  Date.prototype.setYear = function(year) {
    return this.setFullYear(year + 1900);
  };
}

// https://bugs.webkit.org/show_bug.cgi?id=9532

var _testDate = new Date(Date.UTC(2006, 1, 20));
_testDate.setUTCDate(15);
if (_testDate.getUTCHours() != 0) {
  forEach.csv("FullYear,Month,Date,Hours,Minutes,Seconds,Milliseconds", function(type) {
    extend(Date.prototype, "setUTC" + type, function() {
      var value = this.base.apply(this, arguments);
      if (value >= 57722401000) {
        value -= 3600000;
        this.setTime(value);
      }
      return value;
    });
  });
}

// =========================================================================
// js/~/Function.js
// =========================================================================

// Some browsers don't define this.
Function.prototype.prototype = {};

// =========================================================================
// js/~/String.js
// =========================================================================

// A KHTML bug.
if ("".replace(/^/, K("$$")) == "$") {
  extend(String.prototype, "replace", function(expression, replacement) {
    if (typeof replacement == "function") {
      var fn = replacement;
      replacement = function() {
        return String(fn.apply(null, arguments)).split("$").join("$$");
      };
    }
    return this.base(expression, replacement);
  });
}

// =========================================================================
// js/Array2.js
// =========================================================================

var Array2 = _createObject2(
  Array,
  Array,
  "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", // generics
  Enumerable, {
    batch: function(array, block, timeout, oncomplete, context) {
      var index = 0,
          length = array.length;
      var batch = function() {
        var now = Date2.now(), start = now, k = 0;
        while (index < length && (now - start < timeout)) {
          block.call(context, array[index], index++, array);
          if (k++ < 5 || k % 50 == 0) now = Date2.now();
        }
        if (index < length) {
          setTimeout(batch, 10);
        } else {
          if (oncomplete) oncomplete.call(context);
        }
      };
      setTimeout(batch, 1);
    },

    combine: function(keys, values) {
      // Combine two arrays to make a hash.
      if (!values) values = keys;
      return Array2.reduce(keys, function(hash, key, index) {
        hash[key] = values[index];
        return hash;
      }, {});
    },

    contains: function(array, item) {
      return Array2.indexOf(array, item) != -1;
    },

    copy: function(array) {
      var copy = _slice.call(array);
      if (!copy.swap) Array2(copy); // cast to Array2
      return copy;
    },

    flatten: function(array) {
      var i = 0;
      var flatten = function(result, item) {
        if (Array2.like(item)) {
          Array2.reduce(item, flatten, result);
        } else {
          result[i++] = item;
        }
        return result;
      };
      return Array2.reduce(array, flatten, []);
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
    
    insertAt: function(array, index, item) {
      Array2.splice(array, index, 0, item);
    },
    
    item: function(array, index) {
      if (index < 0) index += array.length; // starting from the end
      return array[index];
    },
    
    lastIndexOf: function(array, item, fromIndex) {
      var length = array.length;
      if (fromIndex == null) {
        fromIndex = length - 1;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, length + fromIndex);
      }
      for (var i = fromIndex; i >= 0; i--) {
        if (array[i] === item) return i;
      }
      return -1;
    },
  
    map: function(array, block, context) {
      var result = [];
      _Array_forEach (array, function(item, index) {
        result[index] = block.call(context, item, index, array);
      });
      return result;
    },

    remove: function(array, item) {
      var index = Array2.indexOf(array, item);
      if (index != -1) Array2.removeAt(array, index);
    },

    removeAt: function(array, index) {
      Array2.splice(array, index, 1);
    },

    swap: function(array, index1, index2) {
      if (index1 < 0) index1 += array.length; // starting from the end
      if (index2 < 0) index2 += array.length;
      var temp = array[index1];
      array[index1] = array[index2];
      array[index2] = temp;
      return array;
    }
  }
);

Array2.forEach = _Array_forEach;
Array2.reduce = Enumerable.reduce; // Mozilla does not implement the thisObj argument

Array2.like = function(object) {
  // is the object like an array?
  return typeOf(object) == "object" && typeof object.length == "number";
};

// introspection (removed when packed)
;;; Enumerable["#implemented_by"].pop();
;;; Enumerable["#implemented_by"].push(Array2);

// =========================================================================
// js/Date2.js
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

//var _TRIM_ZEROES   = /(((00)?:0+)?:0+)?\.0+$/;
//var _TRIM_TIMEZONE = /(T[0-9:.]+)$/;

var Date2 = _createObject2(
  Date, 
  function(yy, mm, dd, h, m, s, ms) {
    switch (arguments.length) {
      case 0: return new Date;
      case 1: return typeof yy == "string" ? new Date(Date2.parse(yy)) : new Date(yy.valueOf());
      default: return new Date(yy, mm, arguments.length == 2 ? 1 : dd, h || 0, m || 0, s || 0, ms || 0);
    }
  }, "", {
    toISOString: function(date) {
      var string = "####-##-##T##:##:##.###";
      for (var part in _DATE_PARTS) {
        string = string.replace(/#+/, function(digits) {
          var value = date["getUTC" + part]();
          if (part == "Month") value++; // js month starts at zero
          return ("000" + value).slice(-digits.length); // pad
        });
      }
      //// remove trailing zeroes, and remove UTC timezone, when time's absent
      //return string.replace(_TRIM_ZEROES, "").replace(_TRIM_TIMEZONE, "$1Z");
      return string + "Z";
    }
  }
);

delete Date2.forEach;

Date2.now = function() {
  return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
  if (arguments.length > 1) {
    assertType(defaultDate, "number", "Default date should be of type 'number'.")
  }
  // parse ISO date
  var parts = match(string, _DATE_PATTERN);
  if (parts.length) {
    var month = parts[_DATE_PARTS.Month];
    if (month) parts[_DATE_PARTS.Month] = String(month - 1); // js months start at zero
    // round milliseconds on 3 digits
    if (parts[_TIMEZONE_PARTS.Hectomicroseconds] >= 5) parts[_DATE_PARTS.Milliseconds]++;
    var utc = parts[_TIMEZONE_PARTS.UTC] || parts[_TIMEZONE_PARTS.Hours] ? "UTC" : "";
    var date = new Date(defaultDate || 0);
    if (parts[_DATE_PARTS.Date]) date["set" + utc + "Date"](14);
    for (var part in _DATE_PARTS) {
      var value = parts[_DATE_PARTS[part]];
      if (value) {
        // set a date part
        date["set" + utc + part](value);
        // make sure that this setting does not overflow
        if (date["get" + utc + part]() != parts[_DATE_PARTS[part]]) {
          return NaN;
        }
      }
    }
    // timezone can be set, without time being available
    // without a timezone, local timezone is respected
    if (parts[_TIMEZONE_PARTS.Hours]) {
      var hours = Number(parts[_TIMEZONE_PARTS.Sign] + parts[_TIMEZONE_PARTS.Hours]);
      var minutes = Number(parts[_TIMEZONE_PARTS.Sign] + (parts[_TIMEZONE_PARTS.Minutes] || 0));
      date.setUTCMinutes(date.getUTCMinutes() + (hours * 60) + minutes);
    }
    return date.valueOf();
  } else {
    return NaN;
  }
};

// =========================================================================
// js/String2.js
// =========================================================================

var String2 = _createObject2(
  String, 
  function(string) {
    return new String(arguments.length == 0 ? "" : string);
  },
  "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase",
  {
    csv: csv,
    format: format,
    rescape: rescape,
    trim: trim
  }
);

delete String2.forEach;

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
  return String(string).replace(_LTRIM, "").replace(_RTRIM, "");
};

function csv(string) {
  return string ? (string + "").split(/\s*,\s*/) : [];
};

function format(string) {
  // Replace %n with arguments[n].
  // e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
  // ==> "she sells sea shells"
  // Only %1 - %9 supported.
  var args = arguments;
  var pattern = new RegExp("%([1-" + (arguments.length - 1) + "])", "g");
  return (string + "").replace(pattern, function(match, index) {
    return args[index];
  });
};

function match(string, expression) {
  // Same as String.match() except that this function will return an
  // empty array if there is no match.
  return (string + "").match(expression) || [];
};

function rescape(string) {
  // Make a string safe for creating a RegExp.
  return (string + "").replace(_RESCAPE, "\\$1");
};

// =========================================================================
// js/Function2.js
// =========================================================================

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
    unbind: unbind
  }
);

function I(i) { // Return first argument.
  return i;
};

function II(i, ii) { // Return second argument.
  return ii;
};

function K(k) {
  return function() {
    return k;
  };
};

function bind(fn, context) {
  var lateBound = typeof fn != "function";
  if (arguments.length > 2) {
    var args = _slice.call(arguments, 2);
    return function() {
      return (lateBound ? context[fn] : fn).apply(context, args.concat.apply(args, arguments));
    };
  } else { // Faster if there are no additional arguments.
    return function() {
      return (lateBound ? context[fn] : fn).apply(context, arguments);
    };
  }
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

function partial(fn) { // Based on Oliver Steele's version.
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

// =========================================================================
// base2/detect.js
// =========================================================================

function detect() {
  // Two types of detection:
  //  1. Object detection
  //    e.g. detect("(java)");
  //    e.g. detect("!(document.addEventListener)");
  //  2. Platform detection (browser sniffing)
  //    e.g. detect("MSIE");
  //    e.g. detect("MSIE|Opera");

  var jscript = NaN/*@cc_on||@_jscript_version@*/, // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
      javaEnabled = true;
  if (global.navigator) { // browser
    var MSIE    = /MSIE[\d.]+/g,
        element = document.createElement("span"),
        input   = document.createElement("input"),
        style   = element.style,
        // Close up the space between name and version number.
        //  e.g. MSIE 6 -> MSIE6
        userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
    javaEnabled &= navigator.javaEnabled();
    // Fix Opera's (and others) user agent string.
    if (!jscript) userAgent = userAgent.replace(MSIE, "");
    if (/MSIE/.test(userAgent)) {
      userAgent = userAgent.match(MSIE)[0] + ";" + userAgent
        .replace(MSIE, "")
        .replace(/user\-agent.*$/i, ""); // crap gets appended here
    }
    ;;; userAgent = userAgent.replace(/\.NET CLR[\d\.]*/g, "");
    // Chrome is different enough that it counts as a different vendor.
    // Sniff for Webkit unless you specifically want either Chrome or Safari.
    // Arora is treated as Safari.
    if (/Chrome/.test(userAgent)) userAgent = userAgent.replace(/Safari[\d.]*/gi, "");
    else if (/Gecko/.test(userAgent)) userAgent = userAgent.replace(/Gecko/g, "Gecko/").replace(/rv:/, "Gecko");
    if (!/^CSS/.test(document.compatMode)) userAgent += ";QuirksMode";
    base2.userAgent = userAgent.replace(/like \w+/gi, "") + ";" + navigator.platform;
//} else if (java) { // rhino
//  var System = java.lang.System;
//  base2.userAgent = "Rhino " + System.getProperty("os.arch") + " " + System.getProperty("os.name") + " " + System.getProperty("os.version");
//} else if (jscript) { // Windows Scripting Host
//  base2.userAgent = "WSH";
  }

  var _cache = {};
  detect = function(expression) {
    var not = expression.indexOf("!") == 0;
    if (not) expression = expression.slice(1);
    if (_cache[expression] == null) {
      var returnValue = false,
          test = expression;
      if (test.indexOf("(") == 0) { // Feature detection
        if (base2.dom) {
          test = test
            .replace(/(hasFeature)/, "document.implementation.$1")
            .replace(/\bstyle\.(\w+)/g, function(match, propertyName) {
              if (!style[propertyName]) {
                propertyName = base2.dom.CSSStyleDeclaration.getPropertyName(propertyName);
              }
              return "style." + propertyName;
            })
            .replace(/^\((\w+\.[\w\.]+)\)$/, function(match, feature) {
              feature = feature.split(".");
              var propertyName = feature.pop(), object = feature.join(".");
              return "(" +
                (jscript < 5.6 ?
                  object + "." + propertyName + "!==undefined" :
                  "'" + propertyName + "' in " + object) +
              ")";
            });
        }
        try {
          returnValue = new Function("global,element,input,style,jscript,java", "return !!" + test)(global, element, input, style, jscript, javaEnabled ? global.java : null);
        } catch (x) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        returnValue = new RegExp("(" + test + ")", "i").test(base2.userAgent);
      }
      _cache[expression] = returnValue;
    }
    return !!(not ^ _cache[expression]);
  };
  
  detect.MSIE = !!jscript;
  detect.MSIE5 = jscript < 5.6;
  
  return detect(arguments[0]);
};

// =========================================================================
// base2/init.js
// =========================================================================

base2 = global.base2 = new Package(this, base2);
base2.toString = K("[base2]"); // hide private data here

var exports = this.exports;

lang = new Package(this, lang);
exports += this.exports;

js = new Package(this, js);
eval(exports + this.exports);

lang.extend = extend;

// legacy support
base2.JavaScript = pcopy(js);
base2.namespace += "var JavaScript=js;";

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// jst/package.js
// =========================================================================

// JavaScript Templates

/*
  Based on the work of Erik Arvidsson:
  
    http://erik.eae.net/archives/2005/05/27/01.03.26/
*/

var jst = new base2.Package(this, {
  name:    "jst",
  version: base2.version,
  exports: "Command,Environment,Interpreter,Parser"
});

eval(this.imports);

// =========================================================================
// jst/Command.js
// =========================================================================

var STDOUT = 1;

var Command = Base.extend({
  constructor: function(command) {
    this[STDOUT] = [];
    // Additional commands.
    this.extend(command);
  },
  
  echo: function(string) {
    this[STDOUT].push(string);
  },

  toString: function() {
    return this[STDOUT].join("");
  }
});

// =========================================================================
// jst/Environment.js
// =========================================================================

var Environment = Base.extend({
  set: function(name, value) {
    // Set a variable by name
    this[name] = value;
  },
  
  unset: function(name) {
    delete this[name];
  }
});

// =========================================================================
// jst/Interpreter.js
// =========================================================================

var Interpreter = Base.extend({
  constructor: function(command, environment) {
    this.command = command || {};
    this.environment = new Environment(environment);
    this.parser = new Parser;
  },
  
  command: null,
  environment: null,
  parser: null,
  
  interpret: function(template) {
    var command = new Command(this.command);
    var code = base2.namespace + js.namespace + lang.namespace +
      "\nwith(arguments[0])with(arguments[1]){\n" +
        this.parser.parse(template) +
      "}\nreturn arguments[0].toString()";
    // use new Function() instead of eval() so that the script is evaluated in the global scope
    return new Function(code)(command, this.environment);
  }
});

// =========================================================================
// jst/Escape.js
// =========================================================================

var Escape = Module.extend({
  escape: function(parser, string) {
    if (parser.escapeChar) {
      // Encode escaped characters.
      var ESCAPE = new RegExp(rescape(parser.escapeChar + "."), "g");
      string = string.replace(ESCAPE, function(match) {
        return String.fromCharCode(Escape.BASE + match.charCodeAt(1));
      });
    }
    return string;
  },
  
  unescape: function(parser, string) {
    // Decode escaped characters.
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
// jst/Parser.js
// =========================================================================

// This needs a re-write but it works well enough for now.

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
    var TRIM = /^=|;+$/g,
        BLOCK = /<%[^%]*%([^>][^%]*%)*>/g,
        evaluated = this._evaluated = [];
    var evaluate = function(block) {
      block = block.replace(Parser.TRIM, "");
      if (!block) return "";
      if (block.indexOf("=") == 0) {
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

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// JSON/package.js
// =========================================================================

// This code is loosely based on Douglas Crockford's original:
//  http://www.json.org/json.js

// This package will attempt to mirror the ES4 JSON package.
// This package will not be finalised until the ES4 JSON proposal is also finalised.

var JSON = new base2.Package(this, {
  name:    "JSON",
  imports: "Enumerable",
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

JSON.toString = function(object) {
  if (arguments.length == 0) return "[base2.JSON]";
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
};

function pad(number, length) {
  return "0000".slice(0, (length || 2) - String(number).length) + number;
};

// =========================================================================
// JSON/Object.js
// =========================================================================

JSON.Object = Module.extend({

  toJSONString: function(object) {
    return object == null ? "null" : "{" + reduce(object, function(properties, property, name) {
      if (JSON.Object.isValid(property)) {
        properties.push(JSON.String.toJSONString(name) + ":" + JSON.toString(property));
      }
      return properties;
    }, []).join(",") + "}";
  }
  
}, {
  VALID_TYPE: /^(object|boolean|number|string)$/,
  
  isValid: function(object) {
    return this.VALID_TYPE.test(typeof object);
  }
});

// =========================================================================
// JSON/Array.js
// =========================================================================

JSON.Array = JSON.Object.extend({
  toJSONString: function(array) {
    var i = array.length, strings = [];
    while (i--) strings[i] = JSON.Object.isValid(array[i]) ? JSON.toString(array[i]) : "null";
    return "[" + strings.join(",") + "]";
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
    return '"' + Date2.toISOString(date) + '"';
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
        return new Function("return " + string)();
      }
    } catch (x) {
      throw new SyntaxError("parseJSON");
    }
    return "";
  },

  toJSONString: function(string) {
    return '"' + this.ESCAPE.exec(string) + '"';
  }
}, {
  ESCAPE: new RegGrp({
    '"' :   '\\"',
    '\\\\': '\\\\'
  })
});

JSON.String.ESCAPE.put(
  /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
  function(chr) {
    var charCode = chr.charCodeAt(0);
    return '\\u00' + (~~(charCode / 16)).toString(16) + (charCode % 16).toString(16);
  }
);
eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// io/package.js
// =========================================================================

var io = new base2.Package(this, {
  name:    "io",
  version: base2.version,
  imports: "Enumerable,Function2",
  exports: "NOT_SUPPORTED,READ,WRITE,FileSystem,Directory,LocalFileSystem,LocalDirectory,LocalFile"
});

eval(this.imports);

var NOT_SUPPORTED = function() {
  throw new Error("Not supported.");
};

var READ = 1, WRITE = 2;

var _RELATIVE       = /\/[^\/]+\/\.\./,
    _TRIM_PATH      = /[^\/]+$/,
    _SLASH          = /\//g,
    _BACKSLASH      = /\\/g,
    _LEADING_SLASH  = /^\//,
    _TRAILING_SLASH = /\/$/;

var _INVALID_MODE = function() {
  throw new Error("Invalid file open mode.");
};

var _win_formatter = {
  fromNativePath: function(path) {
    return "/" + String(path).replace(_BACKSLASH, "/");
  },

  toNativePath: function(path) {
    return String(path).replace(_LEADING_SLASH, "").replace(_SLASH, "\\");
  }
};

function _makeNativeAbsolutePath(path) {
  return LocalFileSystem.toNativePath(FileSystem.resolve(LocalFileSystem.getPath(), path));
};

var _fso; // FileSystemObject
function _activex_exec(method, path1, path2, flags) {
  if (!_fso) _fso = new ActiveXObject("Scripting.FileSystemObject");
  path1 = _makeNativeAbsolutePath(path1);
  if (arguments.length > 2) {
    path2 = _makeNativeAbsolutePath(path2);
  }
  switch (arguments.length) {
    case 2: return _fso[method](path1);
    case 3: return _fso[method](path1, path2);
    case 4: return _fso[method](path1, path2, flags);
  }
  return undefined; // Prevent strict warnings
};

function _xpcom_createFile(path) {
  var file = XPCOM.createObject("file/local;1", "nsILocalFile");
  file.initWithPath(_makeNativeAbsolutePath(path));
  return file;
};

function _java_createFile(path) {
  return new java.io.File(_makeNativeAbsolutePath(path));
};

// =========================================================================
// utils/XPCOM.js
// =========================================================================

// Some useful methods for dealing with XPCOM.

var XPCOM = Module.extend({
  privelegedMethod: I, // no such thing as priveleged for non-Mozilla browsers
  privelegedObject: I,
  
  "@(Components)": {
    createObject: function(classPath, interfaceId) {
      if (classPath.indexOf("@") != 0) {
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
// io/FileSystem.js
// =========================================================================

// A base class to derive file systems from.
// Here we'll define all the path management code.

var FileSystem = Base.extend({
  constructor: function(path) {
    if (path) this.chdir(path);
  },

  path: "/",

  chdir: function(path) {
    // Set the current path.
    assert(this.isDirectory(path), path + " is not a directory.");
    path = this.makepath(path);
    if (!_TRAILING_SLASH.test(path)) path += "/";
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
    // Stringify.
    path1 = String(path1 || "");
    path2 = String(path2 || "");
    // Create a full path from two paths.
    if (path2.indexOf("/") == 0) {
      var path = "";
    } else {
      path = path1.replace(_TRIM_PATH, "");
    }
    path += path2;
    // Resolve relative paths.
    while (_RELATIVE.test(path)) {
      path = path.replace(_RELATIVE, "");
    }
    return path;
  }
});

// =========================================================================
// io/Directory.js
// =========================================================================

// A collection of stubs that map out the directory structure.
// Tt's too expensive to create full file objects...

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
      this.name = name + "";
      this.isDirectory = !!isDirectory;
      this.size = isDirectory ? 0 : size || 0;
    },

    name : "",
    isDirectory: false,
    size: 0,
    
    toString: function() {
      return this.name;
    }
  }
});

// =========================================================================
// io/LocalFileSystem.js
// =========================================================================

var LocalFileSystem = FileSystem.extend({
  constructor: function(path) {
    this.path = LocalFileSystem.getPath();
    this.base(path);
  },

  backup: function(path, extension) {
    if (this.isFile(path)) {
      if (!extension) extension = ".backup";
      this.write(path + extension, this.read(path));
    }
  },
  
  read: function(path) {
    if (this.isDirectory(path)) {
      return new LocalDirectory(this.makepath(path));
    } else {
      var file = new LocalFile(this.makepath(path));
      file.open(READ);
      var text = file.read();
      file.close();
      return text;
    }
  },

  write: function(path, text) {
    var file = new LocalFile(this.makepath(path));
    file.open(WRITE);
    file.write(text);
    file.close();
  },

  "@(ActiveXObject)": {
    copy: function(path1, path2) {
      _activex_exec(this.isDirectory(path1) ? "CopyFolder" : "CopyFile", this.makepath(path1), this.makepath(path2), true);
    },

    exists: function(path) {
      return this.isFile(path) || this.isDirectory(path);
    },

    isFile: function(path) {
      return _activex_exec("FileExists", this.makepath(path));
    },
    
    isDirectory: function(path) {
      return _activex_exec("FolderExists", this.makepath(path));
    },
  
    mkdir: function(path) {
      _activex_exec("CreateFolder", this.makepath(path));
    },
    
    move: function(path1, path2) {
      _activex_exec(this.isDirectory(path1) ? "MoveFolder" : "MoveFile", this.makepath(path1), this.makepath(path2));
    },
    
    remove: function(path) {
      if (this.isFile(path)) {
        _activex_exec("DeleteFile", this.makepath(path));
      } else if (this.isDirectory(path)) {
        _activex_exec("DeleteFolder", this.makepath(path));
      }
    }
  },

  "@(Components)": { // XPCOM
    copy: function(path1, path2) {
      var file1 = _xpcom_createFile(this.makepath(path1));
      var file2 = _xpcom_createFile(this.makepath(path2));
      
      file1.copyTo(file2.parent, file2.leafName);
    },
    
    exists: function(path) {
      return _xpcom_createFile(this.makepath(path)).exists();
    },
    
    isFile: function(path) {
      var file = _xpcom_createFile(this.makepath(path));
      return file.exists() && file.isFile();
    },
    
    isDirectory: function(path) {
      var file = _xpcom_createFile(this.makepath(path));
      return file.exists() && file.isDirectory();
    },
  
    mkdir: function(path) {
      _xpcom_createFile(this.makepath(path)).create(1);
    },
    
    move: function(path1, path2) {
      var file1 = _xpcom_createFile(this.makepath(path1));
      var file2 = _xpcom_createFile(this.makepath(path2));
      file1.moveTo(file2.parent, file2.leafName);
    },
    
    remove: function(path) {
      _xpcom_createFile(this.makepath(path)).remove(false);
    }
  },

  "@(java && !global.Components)": {
    exists: function(path) {
      return _java_createFile(this.makepath(path)).exists();
    },

    isFile: function(path) {
      return _java_createFile(this.makepath(path)).isFile();
    },

    isDirectory: function(path) {
      return _java_createFile(this.makepath(path)).isDirectory();
    },

    mkdir: function(path) {
      _java_createFile(this.makepath(path)).mkdir();
    },

    move: function(path1, path2) {
      var file1 = _java_createFile(this.makepath(path1));
      var file2 = _java_createFile(this.makepath(path2));
      file1.renameTo(file2);
    },

    remove: function(path) {
      _java_createFile(this.makepath(path))["delete"]();
    }
  }
}, {
  init: function() {
    forEach.csv("copy,move", function(method) {
      extend(this, method, function(path1, path2, overwrite) {
        assert(this.exists(path1), "File does not exist: " + path1);
        if (this.exists(path2)) {
          if (overwrite) {
            this.remove(path2);
          } else {
            throw new Error("File already exists: " + path2);
          }
        }
        this.base(path1, path2);
      });
    }, this.prototype);
  },

  "@(Components)": { // XPCOM
    init: function() {
      this.base();
      XPCOM.privelegedObject(this.prototype);
    }
  },
  
  fromNativePath: I,
  toNativePath: I,

  getPath: K("/"),

  "@(global.java.io.File.separator=='\\\\')": _win_formatter,
  "@(jscript)": _win_formatter,
  "@win(32|64)": _win_formatter,
  
  "@(java)": {
    getPath: function() {
      return this.fromNativePath(new java.io.File("").getAbsolutePath());
    }
  },

  "@(ActiveXObject)": {
    getPath: function() {
      var fso = new ActiveXObject("Scripting.FileSystemObject");
      return this.fromNativePath(fso.GetFolder(".").path);
    }
  },

  "@(location)": {
    getPath: function() {
      return decodeURIComponent(location.pathname.replace(_TRIM_PATH, ""));
    }
  },

  "@(true)": {
    getPath: function() { // memoise
      var path = this.base();
      this.getPath = K(path);
      return path;
    }
  }
});

// =========================================================================
// io/LocalDirectory.js
// =========================================================================

var LocalDirectory = Directory.extend({
  "@(ActiveXObject)": {
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var directory = _activex_exec("GetFolder", path);
        forEach ([directory.SubFolders, directory.Files], function(list) {
          var enumerator = new Enumerator(list);
          while (!enumerator.atEnd()) {
            var file = enumerator.item();
            this.put(file.Name, file);
            enumerator.moveNext();
          }
        }, this);
      }
    }
  },

  "@(Components)": { // XPCOM
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var file = _xpcom_createFile(path);
        var directory = file.directoryEntries;
        var enumerator = directory.QueryInterface(Components.interfaces.nsIDirectoryEnumerator);
        while (enumerator.hasMoreElements()) {
          file = enumerator.nextFile;
          this.put(file.leafName, file);
        }
      }
    }
  },

  "@(java && !global.Components)": {
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var file = _java_createFile(path);
        var directory = file.list();
        for (var i = 0; i < directory.length; i++) {
          file = new java.io.File(directory[i]);
          this.put(file.getName(), file);
        }
      }
    }
  }
}, {
  "@(ActiveXObject)": {
    create: function(name, file) {
      return new this.Item(name, file.Type | 16, file.Size);
    }
  },

  "@(Components)": {
    create: function(name, file) {
      return new this.Item(name, file.isDirectory(), file.fileSize);
    }
  },

  "@(java && !global.Components)": {
    create: function(name, file) {
      return new this.Item(name, file.isDirectory(), file.length());
    }
  }
});

// =========================================================================
// io/LocalFile.js
// =========================================================================

// A class for reading/writing the local file system. Works for Moz/IE/Opera(java)
// the java version seems a bit buggy when writing...?

var LocalFile = Base.extend({
  constructor: function(path) {
    this.toString = K(FileSystem.resolve(LocalFileSystem.getPath(), path));
  },
  
  close: _INVALID_MODE,
  open: NOT_SUPPORTED,
  read: _INVALID_MODE,
  write: _INVALID_MODE,

  "@(ActiveXObject)": {
    open: function(mode) {
      var path = LocalFileSystem.toNativePath(this);
      var fso = new ActiveXObject("Scripting.FileSystemObject");
      
      switch (mode) {
        case READ:
          assert(fso.FileExists(path), "File does not exist: " + this);
          var stream = fso.OpenTextFile(path, 1);
          this.read = function() {
            return stream.ReadAll();
          };
          break;
          
        case WRITE:
          stream = fso.OpenTextFile(path, 2, -1, 0);
          this.write = function(text) {
            stream.Write(text || "");
          };
          break;
      }
      
      this.close = function() {
        stream.Close();
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  },

  "@(Components)": { // XPCOM
    open: function(mode) {
      var file = _xpcom_createFile(this);
      
      switch (mode) {
        case READ:
          assert(file.exists(), "File does not exist: " + this);
          var input = XPCOM.createObject("network/file-input-stream;1", "nsIFileInputStream");
          input.init(file, 0x01, 00004, null);
          var stream = XPCOM.createObject("scriptableinputstream;1", "nsIScriptableInputStream");
          stream.init(input);
          this.read = function() {
            return stream.read(stream.available());
          };
          break;
          
        case WRITE:
          if (!file.exists()) file.create(0, 0664);
          stream = XPCOM.createObject("network/file-output-stream;1", "nsIFileOutputStream");
          stream.init(file, 0x20 | 0x02, 00004, null);
          this.write = function(text) {
            if (text == null) text = "";
            stream.write(text, text.length);
          };
          break;
      }
      
      this.close = function() {
        if (mode == WRITE) stream.flush();
        stream.close();
        
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  },

  "@(java && !global.Components)": {
    open: function(mode) {
      var path = LocalFileSystem.toNativePath(this);
      var io = java.io;
      
      switch (mode) {
        case READ:
          var file = _java_createFile(this);
          assert(file.exists(), "File does not exist: " + this);
          var stream = new io.BufferedReader(new io.FileReader(path));
          this.read = function() {
            var lines = [], line, i = 0;
            while ((line = stream.readLine()) != null) {
              lines[i++] = line;
            }
            return lines.join("\r\n");
          };
          break;
          
        case WRITE:
          assert(!global.navigator, "Cannot write to local files with this browser.");
          stream = new io.PrintStream(new io.FileOutputStream(path));
          this.write = function(text) {
            stream.print(text || "");
          };
          break;
      }
      
      this.close = function() {
        stream.close();
        
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  }
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// MiniWeb/package.js
// =========================================================================
/*
  MiniWeb - copyright 2007-2008, Dean Edwards
  http://www.opensource.org/licenses/mit-license.php
*/

// An active document thing

var MiniWeb = new base2.Package(this, {
  name:    "MiniWeb",
  exports: "Client,Server,JSONFileSystem,JSONDirectory,FileSystem,Command,Interpreter,Terminal,Request,History",
  imports: "Enumerable,io",
  version: "0.7.2",
  
  $$: {data: {}},
  
  DOCTYPE: '<!doctype html>',
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
    base2.lang.forEach.csv ("navigateTo,refresh,reload,submit", function(method) {
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
      MiniWeb.readOnly = location.protocol != "file:" || LocalFile.prototype.open == NOT_SUPPORTED;
      MiniWeb.server = new Server;
      MiniWeb.terminal = new Terminal;
      MiniWeb.client = new Client;
    };
    
    window.MiniWeb = this;
  },
  
  register: function(window) {
    this.client.register(window);
  },
  
  resolve: function(path, filename) {
    return io.FileSystem.resolve(path, filename);
  },
  
  save: function(name) {
    if (this.readOnly) {
      alert(
        location.protocol == "file:"
        ?
          "Your browser does not support local file access.\n" +
          "Use Internet Explorer or Firefox instead."
        :
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
    var revision = parseInt(io.read(REVISION), 10);
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
    
    var fs = new LocalFileSystem;
    if (!name) fs.backup(location.pathname);
    fs.write(name || location.pathname, html);
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

MiniWeb.toString = function() {
  return "MiniWeb version " + MiniWeb.version;
};

eval(this.imports);

var _WILD_CARD      = /\*$/,
    _TRIM_PATH      = /[^\/]+$/,
    _SPACE          = /\s+/;

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
      link.onclick = Client.onclick;
    }
    if (!/^javascript/i.test(href)) {
      link.target = "_parent";
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
    var script = "parent.MiniWeb.register(this);var base2=parent.base2;" + 
      base2.namespace + lang.namespace + "js.bind(this);";
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
    return true;
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
        document.open();
        document.write("<script>parent.location.hash='" + hash + "'<\/script>");
        document.close();
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
    request.headers["Allow"] = "OPTIONS,HEAD,GET,POST,PUT,DELETE";
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
// MiniWeb/~/base2/IO/JSONFileSystem.js
// =========================================================================

var _FETCH = "#fetch";

var JSONFileSystem = FileSystem.extend({
  constructor: function(data) {
    this[_FETCH] = function(path) {
      // fetch data from the JSON object, regardless of type
      path = this.makepath(path);
      return reduce(path.split("/"), function(file, name) {
        if (file && name) file = (name in file) ? file[name] : undefined; // code looks silly but stops warnings being generated in Firebug
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
    // Create a directory.
    this.write(path, {});
  },
  
  move: function(path1, path2) {
    var data = this[_FETCH](path1);
    this.write(path2, data);
    this.remove(path1);
  },

  read: function(path) {    
    // Read text from the JSON object.
    var file = this[_FETCH](path);
    return typeof file == "object" ?
      new JSONDirectory(file) : file || ""; // make read safe
  },
  
  remove: function(path) {
    // Remove data from the JSON object.
    path = path.replace(/\/$/, "").split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    if (directory) delete directory[filename];
  },

  write: function(path, data) {
    // Write data to the JSON object.
    path = path.split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    assert(directory, "Directory not found."); 
    return directory[filename] = data || "";
  }
});

// =========================================================================
// MiniWeb/~/base2/IO/JSONDirectory.js
// =========================================================================

var JSONDirectory = Directory.extend(null, {

  create: function(name, item) {
    return new this.Item(name, typeof item == "object", typeof item == "string" ? item.length : 0);
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
    var interpreter = new jst.Interpreter(this);
    this[Command.INCLUDES] = {};
    this.exec = function(template, target) {
      var result = "";
      var dir = template.replace(_TRIM_PATH, "");
      if (command.isDirectory(dir)) {
        command.parent = command.self;
        if (!command.top) {
          command.top =
          command.parent = this.makepath(template);
        }
        var path = command.path;
        var restore = command.target;
        command.self = this.makepath(template);
        command.chdir(dir);
        command.target = target || "";
        result = interpreter.interpret(this.read(template));
        command.target = restore;
        command.path = path;
        command.self = command.parent;
      }
      return result;
    };
  },
  
  parent: "",
  self: "",
  target: "",
  top: "",
  
  args: function(names) {
    // define template arguments in the current scope
    var args = this.target.split(_SPACE);
    forEach.csv(names, function(name, index) {
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
    if (_WILD_CARD.test(target)) { // process everything in the current directory
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
    forEach (Array2.slice(arguments, 2), function(target) {
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

var Interpreter = Command.extend({
  constructor: function(request) {
    this.base();
    this.request = pcopy(request);
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
        return this.base.apply(this, arguments);
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
    var fs = new LocalFileSystem;
    if (!MiniWeb.readOnly && fs.exists(this.TMP)) {
      var state = JSON.parse(fs.read(this.TMP));
      fs.remove(this.TMP);
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
      var fs = new LocalFileSystem;
      fs.write(this.TMP, JSON.toString(state));
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

// Not used.

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

// Not used.

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
        return Element.matchesSelector(item, ":active");
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
