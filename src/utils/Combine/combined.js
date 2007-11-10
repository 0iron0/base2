//--| Combine: ../../../lib/src/base2-legacy.js

// fix JavaScript for IE5.0 (and others)
window.$Legacy = window.$Legacy || {namespace:""};
window.undefined = window.undefined;

new function() {
	var MSIE = /*@cc_on!@*/false;
	var E = window.Error, slice = Array.prototype.slice;	
	
	if (!document.nodeType) document.nodeType = 9; // IE5.0
	
	$Legacy.has = function e(o,k) {
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

//--| Combine: ../../../lib/src/base2.js
// timestamp: Mon, 23 Jul 2007 11:49:58
/*
	base2 - copyright 2007, Dean Edwards
	http://code.google.com/p/base2/
	http://www.opensource.org/licenses/mit-license
*/

var base2 = {
	name:    "base2",
	version: "0.9 (alpha)",
	
	global: this, // the window object in a browser environment
		
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

// private
var _ID = 1;
var _PRIVATE = /^[_$]/;
var _FORMAT = /%([1-9])/g;
var _LTRIM = /^\s\s*/;
var _RTRIM = /\s\s*$/;
var _RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;           // safe regular expressions
var _BASE = /eval/.test(detect) ? /\bbase\b/ : /./;   // some platforms don't allow decompilation
var _HIDDEN = ["constructor", "toString", "valueOf"]; // only override these when prototyping
var _REGEXP_STRING = String(new RegExp);
var _slice = Array.prototype.slice;
var _Function_forEach = _get_Function_forEach();      // curse you Safari!

// =========================================================================
// base2/Base.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/03/base/

function Base() {
	if (this.constructor == Base) {
		this.extend(arguments[0]);
	} else {
		return extend(arguments[0], Base.prototype);
	}
};

Base.prototype = {
	constructor: Base,

	base: function() {
		// Call this method from any other method to invoke the current method's ancestor (super).
	},
	
	extend: delegate(extend)	
};

Base.ancestor = Object;

Base.ancestorOf = delegate(_ancestorOf);

Base.base = Base.prototype.base;

Base.extend = function(_instance, _static) {
	// Build the prototype.
	base2.__prototyping = true;
	var _prototype = new this;
	extend(_prototype, _instance);
	delete base2.__prototyping;
	
	// Create the wrapper for the constructor function.
	var _constructor = _prototype.constructor;
	function klass() {
		if (!base2.__prototyping) { // Don't call the constructor function when prototyping.
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
	return klass;
};
	
Base.forEach = delegate(_Function_forEach),

Base.implement = function(source) {
	if (instanceOf(source, Function)) {
		// If we are implementing another classs/module then we can use
		// casting to apply the interface.
		if (Base.ancestorOf(source)) {
			source(this.prototype);
		}
	} else {
		// Add the interface using the extend() function.
		extend(this.prototype, source);
	}
	return this;
};

Base.init = Undefined;

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
		this.exports += "," + name;
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
		// Inherit module methods.
		forEach (this, function(method, name) {
			if (!Module[name] && typeof method == "function" && !_PRIVATE.test(name)) {
				extend(module, name, method);
			}
		});
		// Iplement module (instance AND static) methods.
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
					if (!Module[name] && typeof method == "function" && !_PRIVATE.test(name)) {
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
				} else if (!Module[name] && typeof source == "function") {
					function _module() { // Late binding.
						return module[name].apply(module, [this].concat(slice(arguments)));
					};
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
		//-dean: test Mozilla's implementation with undefined values
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
		//return !this.every(object, not(test), context);
		return !this.every(object, function(value, key) {
			return !test.call(context, value, key, object);
		});
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
			return $Legacy.has(this, _HASH + key);
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
		forEach (arguments, function(values) {
			forEach (values, function(value, key) {
				this.put(key, value);
			}, this);
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
		assert(!this.has(key), "Duplicate key '" + key + "'.");
		return this.put.apply(this, arguments);
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
		var length = keys.length, i;
		for (i = 0; i < length; i++) {
			block.call(context, this[_HASH + keys[i]], keys[i], this);
		}
	},

	indexOf: function(key) {
		return this[_KEYS].indexOf(String(key));
	},

	insertAt: function(index, key, item) {
		assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
		assert(!this.has(key), "Duplicate key '" + key + "'.");
		this[_KEYS].insertAt(index, String(key));
		return this.put.apply(this, arguments);
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
		if (keyDeleted || this.has(key)) {
			if (!keyDeleted) {                   // The key has already been deleted by removeAt().
				this[_KEYS].remove(String(key)); // We still have to delete the value though.
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
		if (!this.has(key)) {
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
		return this.put.apply(this, arguments);
	},

	toString: function() {
		return String(this[_KEYS]);
	}
}, {
	Item: null, // If specified, all members of the collection must be instances of Item.
	
	init: function() {
		this.prototype.item = this.prototype.getAt;
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

	exec: function(string, replacement) { // optimised (refers to _HASH)
		string = String(string); // type-safe
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
		var BACK_REF = /\\(\d+)/g;
		var length = 0;
		return "(" + this.map(function(item) {
			// Fix back references.
			var ref = String(item).replace(BACK_REF, function(match, index) {
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
	
	count: function(expression) {
		// Count the number of sub-expressions in a RegExp/RegGrp.Item.
		return match(String(expression).replace(/\\./g, "").replace(/\(\?[:=!]|\[[^\]]+\]/g, ""), /\(/g).length;
	},
	
	init: function() {
		forEach ("add,exists,fetch,remove,store".split(","), function(name) {
			extend(this, name, function(expression) {
				if (instanceOf(expression, RegExp)) {
					expression = expression.source;
				}
				return base(this, arguments);
			});
		}, this.prototype);
	}
});

// =========================================================================
// base2/RegGrp/Item.js
// =========================================================================

RegGrp.Item = Base.extend({
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
		this.toString = partial(String, expression);
	},
	
	length: 0,
	replacement: ""
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

// Create a faux constructor that augments the built-in Array object.
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
		
		copy: function(array) {
			return this(this.concat(array)); // and cast to Array2
		},
		
		contains: function(array, item) {
			return this.indexOf(array, item) != -1;
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
		}
	}]
);

Array2.prototype.forEach = delegate(_Array_forEach);

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
	
	return Native2;
};

// =========================================================================
// lang/extend.js
// =========================================================================

function base(object, args) {
	return object.base.apply(object, args);
};

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
			if (typeof value == "function") {
				var ancestor = object[key];
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
	
	// If the class is a Base class then it would have passed the test above.
	if (_isBaseClass(klass)) return false;
	
	// Base objects can only be instances of Object.
	if (_isBaseClass(object.constructor)) return klass == Object;
	
	if (object != null) switch (klass) {
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
	return klass == Base || Base.ancestorOf(klass);
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

function Undefined() {
	return undefined;
};

function K(k) {
	return k;
};

function bind(fn, context) {
	var args = slice(arguments, 2);
	function _bind() {
		return fn.apply(context, args.concat(slice(arguments)));
	};
	_bind._cloneID = assignID(fn);
	return _bind;
};

function delegate(fn, context) {
	function _delegate() {
		return fn.apply(context, [this].concat(slice(arguments)));
	};
	return _delegate;
};

function partial(fn) {
	var args = slice(arguments, 1);
	function _partial() {
		return fn.apply(this, args.concat(slice(arguments)));
	};
	return _partial;
};

function unbind(fn) {
	function _unbind(context) {
		return fn.apply(context, slice(arguments, 1));
	};
	return _unbind;
};

// =========================================================================
// base2/init.js
// =========================================================================

base2.exports = "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace," +
	"K,Undefined,assert,assertArity,assertType,assignID,base,bind,copy,delegate,detect,extend,forEach,format,instanceOf,match,partial,rescape,slice,trim,unbind";

base2 = new Namespace(this, base2);
eval(this.exports);

base2.base = base;
base2.extend = extend;

forEach (Enumerable, function(method, name) {
	if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

//--| Combine: ../../../lib/src/base2-dom.js
// timestamp: Mon, 23 Jul 2007 13:59:43

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// DOM/namespace.js
// =========================================================================

var DOM = new base2.Namespace(this, {
	name:    "DOM",
	version: "0.9 (alpha)",
	exports: "Node,Document,Element,AbstractView,Event,EventTarget,DocumentEvent,DocumentSelector,ElementSelector,StaticNodeList,ViewCSS,HTMLDocument,HTMLElement,Selector,Traversal,XPathParser",
	
	bind: function(node) {
		// apply a base2 DOM Binding to a native DOM node
		if (node && node.nodeType) {
			var uid = assignID(node);
			if (!arguments.callee[uid]) {
				switch (node.nodeType) {
					case 1: // Element
						if (typeof node.className == "string") {
							// it's an HTML element, use bindings based on tag name
							(HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
						} else {
							Element.bind(node);
						}
						break;
					case 9: // Document
						if (node.links) {
							HTMLDocument.bind(node);
						} else {
							Document.bind(node);
						}
						break;
					default:
						Node.bind(node);
				}
				arguments.callee[uid] = true;
			}
		}
		return node;
	}
});

eval(this.imports);

// =========================================================================
// DOM/plumbing.js
// =========================================================================

// avoid memory leaks

if (detect("MSIE[56].+win") && !detect("SV1")) {
	var closures = {}; // all closures stored here
	
	extend(base2, "bind", function(method, element) {
		if (!element || element.nodeType != 1) {
			return this.base(method, element);
		}
		
		// unique id's for element and function
		var elementID = element.uniqueID;
		var methodID = assignID(method);
		
		// store the closure in a manageable scope
		closures[methodID] = method;
		
		// reset pointers
		method = null;
		element = null;
		
		if (!closures[elementID]) closures[elementID] = {};
		var closure = closures[elementID][methodID];
		if (closure) return closure; // already stored
		
		// return a new closure with a manageable scope 
		var bound = function() {
			var element = document.all[elementID];
			if (element) return closures[methodID].apply(element, arguments);
		};
		bound._cloneID = methodID;
		closures[elementID][methodID] = bound;
		
		return bound;
	});
	
	attachEvent("onunload", function() {
		closures = null; // closures are destroyed when the page is unloaded
	});
}

// =========================================================================
// DOM/Interface.js
// =========================================================================

// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
	implement: function(_interface) {		
		if (typeof _interface == "object") {
			forEach (_interface, function(source, name) {
				if (name.charAt(0) == "@") {
					forEach (source, arguments.callee, this);
				} else if (!this[name] && typeof source == "function") {
					this.createDelegate(name, source.length);
				}
			}, this);
		}
		return this.base(_interface);
	},
	
	createDelegate: function(name, length) {
		// delegate a static method to the bound object
		//  e.g. for most browsers:
		//    EventTarget.addEventListener(element, type, listener, capture) 
		//  forwards to:
		//    element.addEventListener(type, listener, capture)
		if (!this[name]) {
			var FN = "var fn=function _%1(%2){%3.base=%3.%1.ancestor;var m=%3.base?'base':'%1';return %3[m](%4)}";
			var args = "abcdefghij".split("").slice(-length);
			eval(format(FN, name, args, args[0], args.slice(1)));
			this[name] = fn;
		}
	}
});

// =========================================================================
// DOM/Binding.js
// =========================================================================

var Binding = Interface.extend(null, {
	bind: function(object) {
		return this(object); // cast
	}
});

// =========================================================================
// DOM/Traversal.js
// =========================================================================

// DOM Traversal. Just the basics.

var Traversal = Module.extend({
	getDefaultView: function(node) {
		return this.getDocument(node).defaultView;
	},
	
	getNextElementSibling: function(node) {
		// return the next element to the supplied element
		//  nextSibling is not good enough as it might return a text or comment node
		while (node && (node = node.nextSibling) && !this.isElement(node)) continue;
		return node;
	},

	getNodeIndex: function(node) {
		var index = 0;
		while (node && (node = node.previousSibling)) index++;
		return index;
	},
	
	getOwnerDocument: function(node) {
		// return the node's containing document
		return node.ownerDocument;
	},
	
	getPreviousElementSibling: function(node) {
		// return the previous element to the supplied element
		while (node && (node = node.previousSibling) && !this.isElement(node)) continue;
		return node;
	},

	getTextContent: function(node) {
		return node[Traversal.$TEXT];
	},

	isEmpty: function(node) {
		node = node.firstChild;
		while (node) {
			if (node.nodeType == 3 || this.isElement(node)) return false;
			node = node.nextSibling;
		}
		return true;
	},

	setTextContent: function(node, text) {
		return node[Traversal.$TEXT] = text;
	},
	
	"@MSIE": {
		getDefaultView: function(node) {
			return this.getDocument(node).parentWindow;
		},
	
		"@MSIE5": {
			// return the node's containing document
			getOwnerDocument: function(node) {
				return node.ownerDocument || node.document;
			}
		}
	}
}, {
	$TEXT: "textContent",
	
	contains: function(node, target) {
		while (target && (target = target.parentNode) && node != target) continue;
		return !!target;
	},
	
	getDocument: function(node) {
		// return the document object
		return this.isDocument(node) ? node : this.getOwnerDocument(node);
	},
	
	isDocument: function(node) {
		return !!(node && node.documentElement);
	},
	
	isElement: function(node) {
		return !!(node && node.nodeType == 1);
	},
	
	"@(element.contains)": {	
		contains: function(node, target) {
			return node != target && this.isDocument(node) ? node == this.getOwnerDocument(target) : node.contains(target);
		}
	},
	
	"@MSIE": {
		$TEXT: "innerText"
	},
	
	"@MSIE5": {
		isElement: function(node) {
			return !!(node && node.nodeType == 1 && node.tagName != "!");
		}
	}
});

// =========================================================================
// DOM/views/AbstractView.js
// =========================================================================

// This is just fluff for now.

var AbstractView = Binding.extend();

// =========================================================================
// DOM/events/Event.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({	
	"@!(document.createEvent)": {
		initEvent: function(event, type, bubbles, cancelable) {
			event.type = type;
			event.bubbles = bubbles;
			event.cancelable = cancelable;
		},
		
		"@MSIE": {
			initEvent: function(event, type, bubbles, cancelable) {
				this.base(event, type, bubbles, cancelable);
				event.cancelBubble = !event.bubbles;
			},
			
			preventDefault: function(event) {
				if (event.cancelable !== false) {
					event.returnValue = false;
				}
			},
		
			stopPropagation: function(event) {
				event.cancelBubble = true;
			}
		}
	}
}, {
	"@MSIE": {		
		"@Mac": {
			bind: function(event) {
				// Mac IE5 does not allow expando properties on the event object so
				//  we copy the object instead.
				return this.base(extend({
					preventDefault: function() {
						if (this.cancelable !== false) {
							this.returnValue = false;
						}
					}
				}, event));
			}
		},
		
		"@Windows": {
			bind: function(event) {
				this.base(event);
				if (!event.target) {
					event.target = event.srcElement;
				}
				return event;
			}
		}
	}
});

// =========================================================================
// DOM/events/EventTarget.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var EventTarget = Interface.extend({
	"@!(element.addEventListener)": {
		addEventListener: function(target, type, listener, capture) {
			// assign a unique id to both objects
			var targetID = assignID(target);
			var listenerID = listener._cloneID || assignID(listener);
			// create a hash table of event types for the target object
			var events = EventTarget.$all[targetID];
			if (!events) events = EventTarget.$all[targetID] = {};
			// create a hash table of event listeners for each object/event pair
			var listeners = events[type];
			var current = target["on" + type];
			if (!listeners) {
				listeners = events[type] = {};
				// store the existing event listener (if there is one)
				if (current) listeners[0] = current;
			}
			// store the event listener in the hash table
			listeners[listenerID] = listener;
			if (current !== undefined) {
				target["on" + type] = delegate(EventTarget.$handleEvent);
			}
		},
	
		dispatchEvent: function(target, event) {
			return EventTarget.$handleEvent(target, event);
		},
	
		removeEventListener: function(target, type, listener, capture) {
			// delete the event listener from the hash table
			var events = EventTarget.$all[target.base2ID];
			if (events && events[type]) {
				delete events[type][listener.base2ID];
			}
		},
		
		"@MSIE.+win": {
			addEventListener: function(target, type, listener, capture) {
				// avoid memory leaks
				if (typeof listener == "function") {
					listener = bind(listener, target);
				}
				this.base(target, type, listener, capture);
			},
			
			dispatchEvent: function(target, event) {
				event.target = target;
				try {
					return target.fireEvent(event.type, event);
				} catch (error) {
					// the event type is not supported
					return this.base(target, event);
				}
			}
		}
	}
}, {	
	dispatchEvent: function(target, event) {
		// a little sugar
		if (typeof event == "string") {
			var type = event;
			event = DocumentEvent.createEvent(target, "Events");
			Event.initEvent(event, type, false, false);
		}
		this.base(target, event);
	},
	
	"@!(element.addEventListener)": {
		$all : {},
	
		$handleEvent: function(target, event) {
			var returnValue = true;
			// get a reference to the hash table of event listeners
			var events = EventTarget.$all[target.base2ID];
			if (events) {
				event = Event.bind(event); // fix the event object
				var listeners = events[event.type];
				// execute each event listener
				for (var i in listeners) {
					var listener = listeners[i];
					// support the EventListener interface
					if (listener.handleEvent) {
						returnValue = listener.handleEvent(event);
					} else {
						returnValue = listener.call(target, event);
					}
					if (event.returnValue === false) returnValue = false;
					if (returnValue === false) break;
				}
			}
			return returnValue;
		},
		
		"@MSIE": {	
			$handleEvent: function(target, event) {
				if (target.Infinity) {
					target = target.document.parentWindow;
					if (!event) event = target.event;
				}
				return this.base(target, event || Traversal.getDefaultView(target).event);
			}
		}
	}
});

// =========================================================================
// DOM/events/DocumentEvent.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent

var DocumentEvent = Interface.extend({	
	"@!(document.createEvent)": {
		createEvent: function(document, type) {
			return Event.bind({});
		},
	
		"@(document.createEventObject)": {
			createEvent: function(document, type) {
				return Event.bind(document.createEventObject());
			}
		}
	},
	
	"@(document.createEvent)": {
		"@!(document.createEvent('Events'))": { // before Safari 3
			createEvent: function(document, type) {
				// a type of "Events" throws an error on Safari (need to check current builds)
				return this.base(document, type == "Events" ? "UIEvents" : type);
			}
		}
	}
});

// =========================================================================
// DOM/events/DOMContentLoaded.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoaded = Module.extend(null, {
	fired: false,
	
	fire: function() {
		if (!DOMContentLoaded.fired) {
			DOMContentLoaded.fired = true;
			// this function will be called from another event handler so we'll user a timer
			//  to drop out of any current event
			// use a string for old browsers
			setTimeout("base2.DOM.EventTarget.dispatchEvent(document,'DOMContentLoaded')", 0);
		}
	},
	
	init: function() {
		// use the real event for browsers that support it (opera & firefox)
		EventTarget.addEventListener(document, "DOMContentLoaded", function() {
			DOMContentLoaded.fired = true;
		}, false);
		// if all else fails fall back on window.onload
		EventTarget.addEventListener(window, "load", this.fire, false);
	},

	"@(addEventListener)": {
		init: function() {
			this.base();
			addEventListener("load", this.fire, false);
		}
	},

	"@(attachEvent)": {
		init: function() {
			this.base();
			attachEvent("onload", this.fire);
		}
	},

	"@MSIE.+win": {
		init: function() {
			this.base();
			// Matthias Miller/Mark Wubben/Paul Sowden/Me
			document.write("<script id=__ready defer src=//:><\/script>");
			document.all.__ready.onreadystatechange = function() {
				if (this.readyState == "complete") {
					this.removeNode(); // tidy
					DOMContentLoaded.fire();
				}
			};
		}
	},
	
	"@KHTML": {
		init: function() {
			this.base();
			// John Resig
			var timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(timer);
					DOMContentLoaded.fire();
				}
			}, 100);
		}
	}
});

// =========================================================================
// DOM/style/ViewCSS.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Interface.extend({
	"@!(document.defaultView.getComputedStyle)": {
		getComputedStyle: function(view, element, pseudoElement) {
			// pseudoElement parameter is not supported
			return element.currentStyle; //-dean - fix this object too
		}
	}
}, {
	toCamelCase: function(string) {
		return String(string).replace(/\-([a-z])/g, function(match, chr) {
			return chr.toUpperCase();
		});
	}
});

// =========================================================================
// DOM/selectors-api/NodeSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/
// http://www.whatwg.org/specs/web-apps/current-work/#getelementsbyclassname

var NodeSelector = Interface.extend({	
	"@!(element.getElementsByClassName)": { // firefox3?
		getElementsByClassName: function(node, className) {
			if (instanceOf(className, Array)) {
				className = className.join(".");
			}
			return this.querySelectorAll(node, "." + className);
		}
	},
	
	"@!(element.querySelector)": { // future-proof
		querySelectorAll: function(node, selector) {
			return new Selector(selector).exec(node);
		},
		
		querySelector: function(node, selector) {
			return new Selector(selector).exec(node, 1);
		}
	}
});

// automatically bind objects retrieved using the Selectors API

extend(NodeSelector.prototype, {
	querySelectorAll: function(selector) {
		return extend(this.base(selector), "item", function(index) {
			return DOM.bind(this.base(index));
		});
	},
	
	querySelector: function(selector) {
		return DOM.bind(this.base(selector));
	}
});

// =========================================================================
// DOM/selectors-api/DocumentSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#documentselector

var DocumentSelector = NodeSelector.extend();

// =========================================================================
// DOM/selectors-api/ElementSelector.js
// =========================================================================

// more Selectors API sensibleness

var ElementSelector = NodeSelector.extend({
	"@!(element.matchesSelector)": { // future-proof
		matchesSelector: function(element, selector) {
			return new Selector(selector).test(element);
		}
	}
});


// =========================================================================
// DOM/selectors-api/StaticNodeList.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.
// The item() method provides access to elements.
// Implements Enumerable so you can forEach() to your heart's content... :-)

var StaticNodeList = Base.extend({
	constructor: function(nodes) {
		nodes = nodes || [];
		this.length = nodes.length;
		this.item = function(index) {
			return nodes[index];
		};
	},
	
	length: 0,
	
	forEach: function(block, context) {
		var length = this.length; // preserve
		for (var i = 0; i < length; i++) {
			block.call(context, this.item(i), i, this);
		}
	},
	
	item: Undefined, // defined in the constructor function
	
	"@(XPathResult)": {
		constructor: function(nodes) {
		//-	if (nodes instanceof XPathResult) { // doesn't work in Safari
			if (nodes && nodes.snapshotItem) {
				this.length = nodes.snapshotLength;
				this.item = function(index) {
					return nodes.snapshotItem(index);
				};
			} else this.base(nodes);
		}
	}
});

StaticNodeList.implement(Enumerable);

// =========================================================================
// DOM/selectors-api/Selector.js
// =========================================================================

// This object can be instantiated, however it is probably better to use
// the querySelectorAll/querySelector methods on DOM nodes.

// There is no public standard for this object. It just separates the NodeSelector
//  interface from the complexity of the Selector parsers.

var Selector = Base.extend({
	constructor: function(selector) {
		this.toString = partial(String, trim(selector));
	},
	
	exec: function(context, single) {
		try {
			var result = this.$evaluate(context || document, single);
		} catch (error) { // probably an invalid selector =)
			throw new SyntaxError(format("'%1' is not a valid CSS selector.", this));
		}
		return single ? result : new StaticNodeList(result);
	},
	
	test: function(element) {
		//-dean: improve this for simple selectors
		element.setAttribute("b2_test", true);
		var selector = new Selector(this + "[b2_test]");
		var result = selector.exec(Traversal.getOwnerDocument(element), true);
		element.removeAttribute("b2_test");
		return result == element;
	},
	
	$evaluate: function(context, single) {
		return Selector.parse(this)(context, single);
	}
});

// =========================================================================
// DOM/selectors-api/Parser.js
// =========================================================================
	
var Parser = RegGrp.extend({
	constructor: function(items) {
		this.base(items);
		this.cache = {};
		this.sorter = new RegGrp;
		this.sorter.add(/:not\([^)]*\)/, RegGrp.IGNORE);
		this.sorter.add(/([ >](\*|[\w-]+))([^: >+~]*)(:\w+-child(\([^)]+\))?)([^: >+~]*)/, "$1$3$6$4");
	},
	
	cache: null,
	ignoreCase: true,
	
	escape: function(selector) {
		// remove strings
		var QUOTE = /'/g;
		var strings = this._strings = [];
		return this.optimise(this.format(String(selector).replace(Parser.ESCAPE, function(string) {
			strings.push(string.slice(1, -1).replace(QUOTE, "\\'"));
			return "\x01" + strings.length;
		})));
	},
	
	format: function(selector) {
		return selector
			.replace(Parser.WHITESPACE, "$1")
			.replace(Parser.IMPLIED_SPACE, "$1 $2")
			.replace(Parser.IMPLIED_ASTERISK, "$1*$2");
	},
	
	optimise: function(selector) {
		// optimise wild card descendant selectors
		return this.sorter.exec(selector.replace(Parser.WILD_CARD, ">* "));
	},
	
	parse: function(selector) {
		return this.cache[selector] ||
			(this.cache[selector] = this.unescape(this.exec(this.escape(selector))));
	},
	
	unescape: function(selector) {
		// put string values back
		var strings = this._strings;
		return selector.replace(/\x01(\d+)/g, function(match, index) {
			return strings[index - 1];
		});
	}
}, {
	ESCAPE:           /(["'])[^\1]*\1/g,
	IMPLIED_ASTERISK: /([\s>+~,]|[^(]\+|^)([#.:@])/g,
	IMPLIED_SPACE:    /(^|,)([^\s>+~])/g,
	WHITESPACE:       /\s*([\s>+~(),]|^|$)\s*/g,
	WILD_CARD:        /\s\*\s/g,
	
	_nthChild: function(match, args, position, last, not, and, mod, equals) {
		// ugly but it works for both CSS and XPath
		last = /last/i.test(match) ? last + "+1-" : "";
		if (!isNaN(args)) args = "0n+" + args;
		else if (args == "even") args = "2n";
		else if (args == "odd") args = "2n+1";
		args = args.split(/n\+?/);
		var a = args[0] ? (args[0] == "-") ? -1 : parseInt(args[0]) : 1;
		var b = parseInt(args[1]) || 0;
		var not = a < 0;
		if (not) {
			a = -a;
			if (a == 1) b++;
		}
		var query = format(a == 0 ? "%3%7" + (last + b) : "(%4%3-%2)%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
		if (not) query = not + "(" + query + ")";
		return query;
	}
});

// =========================================================================
// DOM/selectors-api/Selector/operators.js
// =========================================================================

Selector.operators = {
	"=":  "%1=='%2'",
	"!=": "%1!='%2'", //  not standard but other libraries support it
	"~=": /(^| )%1( |$)/,
	"|=": /^%1(-|$)/,
	"^=": /^%1/,
	"$=": /%1$/,
	"*=": /%1/
};

Selector.operators[""] = "%1!=null";

// =========================================================================
// DOM/selectors-api/Selector/pseudoClasses.js
// =========================================================================

Selector.pseudoClasses = { //-dean: lang()
	"checked":     "e%1.checked",
	"contains":    "e%1[Traversal.$TEXT].indexOf('%2')!=-1",
	"disabled":    "e%1.disabled",
	"empty":       "Traversal.isEmpty(e%1)",
	"enabled":     "e%1.disabled===false",
	"first-child": "!Traversal.getPreviousElementSibling(e%1)",
	"last-child":  "!Traversal.getNextElementSibling(e%1)",
	"only-child":  "!Traversal.getPreviousElementSibling(e%1)&&!Traversal.getNextElementSibling(e%1)",
	"root":        "e%1==Traversal.getDocument(e%1).documentElement"
/*	"lang": function(element, lang) {
		while (element && !element.getAttribute("lang")) {
			element = element.parentNode;
		}
		return element && lang.indexOf(element.getAttribute("lang")) == 0;
	}, */
};

// =========================================================================
// DOM/selectors-api/Selector/parse.js
// =========================================================================

// CSS parser - converts CSS selectors to DOM queries.

// Hideous code but it produces fast DOM queries.
// Respect due to Alex Russell and Jack Slocum for inspiration.

// TO DO:
// * sort nodes into document order (comma separated queries only)

new function(_) {
	// some constants
	var _MSIE = detect("_MSIE");
	var _MSIE5 = detect("_MSIE5");
	var _INDEXED = detect("(element.sourceIndex)") ;
	var _VAR = "var p%2=0,i%2,e%2,n%2=e%1.";
	var _ID = _INDEXED ? "e%1.sourceIndex" : "assignID(e%1)";
	var _TEST = "var g=" + _ID + ";if(!p[g]){p[g]=1;";
	var _STORE = "r[r.length]=e%1;if(s)return e%1;";
	var _FN = "fn=function(e0,s){indexed++;var r=[],p={},reg=[%1]," +
		"d=Traversal.getDocument(e0),c=d.body?'toUpperCase':'toString';";
	
	// IE confuses the name attribute with id for form elements,
	// use document.all to retrieve all elements with name/id instead
	var byId = _MSIE ? function(document, id) {
		var result = document.all[id] || null;
		// returns a single element or a collection
		if (!result || result.id == id) return result;
		// document.all has returned a collection of elements with name/id
		for (var i = 0; i < result.length; i++) {
			if (result[i].id == id) return result[i];
		}
		return null;
	} : function(document, id) {
		return document.getElementById(id);
	};
	
	// register a node and _index its children
	var indexed = 1;
	function register(element) {
		if (element.b2_indexed != indexed) {
			var _index = 0;
			var child = element.firstChild;
			while (child) {
				if (child.nodeType == 1 && child.tagName != "!") {
					child.b2_index = ++_index;
				}
				child = child.nextSibling;
			}
			element.b2_length = _index;
			element.b2_indexed = indexed;
		}
		return element;
	};
	
	// variables used by the parser
	var fn;
	var reg; // a store for RexExp objects
	var _index;
	var _wild; // need to flag certain _wild card selectors as _MSIE includes comment nodes
	var _list; // are we processing a node _list?
	var _duplicate; // possible duplicates?
	var _cache = {}; // store parsed selectors
	
	// a hideous parser
	var parser = new Parser({
		"^ \\*:root": function(match) { // :root pseudo class
			_wild = false;
			var replacement = "e%2=d.documentElement;if(Traversal.contains(e%1,e%2)){";
			return format(replacement, _index++, _index);
		},
		" (\\*|[\\w-]+)#([\\w-]+)": function(match, tagName, id) { // descendant selector followed by _ID
			_wild = false;
			var replacement = "var e%2=byId(d,'%4');if(e%2&&";
			if (tagName != "*") replacement += "e%2.nodeName=='%3'[c]()&&";
			replacement += "Traversal.contains(e%1,e%2)){";
			if (_list) replacement += format("i%1=n%1.length;", _list);
			return format(replacement, _index++, _index, tagName, id);
		},
		" (\\*|[\\w-]+)": function(match, tagName) { // descendant selector
			_duplicate++; // this selector may produce duplicates
			_wild = tagName == "*";
			var replacement = _VAR;
			// IE5.x does not support getElementsByTagName("*");
			replacement += (_wild && _MSIE5) ? "all" : "getElementsByTagName('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			return format(replacement, _index++, _list = _index, tagName);
		},
		">(\\*|[\\w-]+)": function(match, tagName) { // child selector
			var children = _MSIE && _list;
			_wild = tagName == "*";
			var replacement = _VAR;
			// use the children property for _MSIE as it does not contain text nodes
			//  (but the children collection still includes comments).
			// the document object does not have a children collection
			replacement += children ? "children": "childNodes";
			if (!_wild && children) replacement += ".tags('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			if (_wild) {
				replacement += "if(e%2.nodeType==1){";
				_wild = _MSIE5;
			} else {
				if (!children) replacement += "if(e%2.nodeName=='%3'[c]()){";
			}
			return format(replacement, _index++, _list = _index, tagName);
		},
		"\\+(\\*|[\\w-]+)": function(match, tagName) { // direct adjacent selector
			var replacement = "";
			if (_wild && _MSIE) replacement += "if(e%1.tagName!='!'){";
			_wild = false;
			replacement += "e%1=Traversal.getNextElementSibling(e%1);if(e%1";
			if (tagName != "*") replacement += "&&e%1.nodeName=='%2'[c]()";
			replacement += "){";
			return format(replacement, _index, tagName);
		},
		"~(\\*|[\\w-]+)": function(match, tagName) { // indirect adjacent selector
			var replacement = "";
			if (_wild && _MSIE) replacement += "if(e%1.tagName!='!'){";
			_wild = false;
			_duplicate = 2; // this selector may produce duplicates
			replacement += "while(e%1=e%1.nextSibling){if(e%1.b2_adjacent==indexed)break;e%1.b2_adjacent=indexed;if(";
			if (tagName == "*") {
				replacement += "e%1.nodeType==1";
				if (_MSIE5) replacement += "&&e%1.tagName!='!'";
			} else replacement += "e%1.nodeName=='%2'[c]()";
			replacement += "){";
			return format(replacement, _index, tagName);
		},
		"#([\\w-]+)": function(match, id) { // _ID selector
			_wild = false;
			var replacement = "if(e%1.id=='%2'){";
			if (_list) replacement += format("i%1=n%1.length;", _list);
			return format(replacement, _index, id);
		},
		"\\.([\\w-]+)": function(match, className) { // class selector
			_wild = false;
			// store RegExp objects - slightly faster on IE
			reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
			return format("if(reg[%2].test(e%1.className)){", _index, reg.length - 1);
		},
		":not\\((\\*|[\\w-]+)?([^)]*)\\)": function(match, tagName, filters) { // :not pseudo class
			var replacement = (tagName && tagName != "*") ? format("if(e%1.nodeName=='%2'[c]()){", _index, tagName) : "";
			replacement += parser.exec(filters);
			return "if(!" + replacement.slice(2, -1).replace(/\)\{if\(/g, "&&") + "){";
		},
		":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) { // :nth-child pseudo classes
			_wild = false;
			last = format("e%1.parentNode.b2_length", _index);
			var replacement = "if(p%1!==e%1.parentNode)";
			replacement += "p%1=register(e%1.parentNode);var i=e%1.b2_index;if(";
			return format(replacement, _index) + Parser._nthChild(match, args, "i", last, "!", "&&", "%", "==") + "){";
		},
		":([\\w-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) { // other pseudo class selectors
			return "if(" + format(Selector.pseudoClasses[pseudoClass], _index, args || "") + "){";
		},
		"\\[([\\w-]+)\\s*([^=]?=)?\\s*([^\\]]*)\\]": function(match, attr, operator, value) { // attribute selectors
			var alias = Element.$attributes[attr] || attr;
			if (attr == "class") alias = "className";
			else if (attr == "for") alias = "htmlFor";
			if (operator) {
				attr = format("(e%1.%3||e%1.getAttribute('%2'))", _index, attr, alias);
			} else {
				attr = format("Element.getAttribute(e%1,'%2')", _index, attr);
			}
			var replacement = Selector.operators[operator || ""];
			if (instanceOf(replacement, RegExp)) {
				reg.push(new RegExp(format(replacement.source, rescape(parser.unescape(value)))));
				replacement = "reg[%2].test(%1)";
				value = reg.length - 1;
			}
			return "if(" + format(replacement, attr, value) + "){";
		}
	});
	
	// return the parse() function
	Selector.parse = function(selector) {
		if (!_cache[selector]) {
			reg = []; // store for RegExp objects
			fn = "";
			var selectors = parser.escape(selector).split(",");
			for (var i = 0; i < selectors.length; i++) {
				_wild = _index = _list = 0; // reset
				_duplicate = selectors.length > 1 ? 2 : 0; // reset
				var block = parser.exec(selectors[i]) || "throw;";
				if (_wild && _MSIE) { // IE's pesky comment nodes
					block += format("if(e%1.tagName!='!'){", _index);
				}
				// check for duplicates before storing results
				var store = (_duplicate > 1) ? _TEST : "";
				block += format(store + _STORE, _index);
				// add closing braces
				block += Array(match(block, /\{/g).length + 1).join("}");
				fn += block;
			}
			eval(format(_FN, reg) + parser.unescape(fn) + "return s?null:r}");
			_cache[selector] = fn;
		}
		return _cache[selector];
	};
};

// =========================================================================
// DOM/selectors-api/xpath/XPathParser.js
// =========================================================================

// XPath parser
// converts CSS expressions to *optimised* XPath queries

// This code used to be quite readable until I added code to optimise *-child selectors. 

var XPathParser = Parser.extend({
	constructor: function() {
		this.base(XPathParser.rules);
		// The sorter sorts child selectors to the end because they are slow.
		// For XPath we need the child selectors to be sorted to the beginning,
		// so we reverse the sort order. That's what this line does:
		this.sorter.putAt(1, "$1$4$3$6");
	},
	
	escape: function(selector) {
		return this.base(selector).replace(/,/g, "\x02");
	},
	
	unescape: function(selector) {
		return this.base(selector
			.replace(/\[self::\*\]/g, "")   // remove redundant wild cards
			.replace(/(^|\x02)\//g, "$1./") // context
			.replace(/\x02/g, " | ")        // put commas back
		);
	},
	
	"@opera": {
		unescape: function(selector) {
			// opera does not seem to support last() but I can't find any 
			//  documentation to confirm this
			return this.base(selector.replace(/last\(\)/g, "count(preceding-sibling::*)+count(following-sibling::*)+1"));
		}
	}
}, {
	init: function() {
		// build the prototype
		this.values.attributes[""] = "[@$1]";
		forEach (this.types, function(add, type) {
			forEach (this.values[type], add, this.rules);
		}, this);
	},
	
	optimised: {		
		pseudoClasses: {
			"first-child": "[1]",
			"last-child":  "[last()]",
			"only-child":  "[last()=1]"
		}
	},
	
	rules: extend({}, {
		"@!KHTML": { // these optimisations do not work on Safari
			// fast id() search
			"(^|\\x02) (\\*|[\\w-]+)#([\\w-]+)": "$1id('$3')[self::$2]",
			// optimise positional searches
			"([ >])(\\*|[\\w-]+):([\\w-]+-child(\\(([^)]+)\\))?)": function(match, token, tagName, pseudoClass, $4, args) {
				var replacement = (token == " ") ? "//*" : "/*";
				if (/^nth/i.test(pseudoClass)) {
					replacement += _nthChild(pseudoClass, args, "position()");
				} else {
					replacement += XPathParser.optimised.pseudoClasses[pseudoClass];
				}
				return replacement + "[self::" + tagName + "]";
			}
		}
	}),
	
	types: {
		identifiers: function(replacement, token) {
			this[rescape(token) + "([\\w-]+)"] = replacement;
		},
		
		combinators: function(replacement, combinator) {
			this[rescape(combinator) + "(\\*|[\\w-]+)"] = replacement;
		},
		
		attributes: function(replacement, operator) {
			this["\\[([\\w-]+)\\s*" + rescape(operator) +  "\\s*([^\\]]*)\\]"] = replacement;
		},
		
		pseudoClasses: function(replacement, pseudoClass) {
			this[":" + pseudoClass.replace(/\(\)$/, "\\(([^)]+)\\)")] = replacement;
		}
	},
	
	values: {
		identifiers: {
			"#": "[@id='$1'][1]", // ID selector
			".": "[contains(concat(' ',@class,' '),' $1 ')]" // class selector
		},
		
		combinators: {
			" ": "/descendant::$1", // descendant selector
			">": "/child::$1", // child selector
			"+": "/following-sibling::*[1][self::$1]", // direct adjacent selector
			"~": "/following-sibling::$1" // indirect adjacent selector
		},
		
		attributes: { // attribute selectors
			"*=": "[contains(@$1,'$2')]",
			"^=": "[starts-with(@$1,'$2')]",
			"$=": "[substring(@$1,string-length(@$1)-string-length('$2')+1)='$2']",
			"~=": "[contains(concat(' ',@$1,' '),' $2 ')]",
			"|=": "[contains(concat('-',@$1,'-'),'-$2-')]",
			"!=": "[not(@$1='$2')]",
			"=":  "[@$1='$2']"
		},
		
		pseudoClasses: { // pseudo class selectors
			"empty":            "[not(child::*) and not(text())]",
//			"lang()":           "[boolean(lang('$1') or boolean(ancestor-or-self::*[@lang][1][starts-with(@lang,'$1')]))]",
			"first-child":      "[not(preceding-sibling::*)]",
			"last-child":       "[not(following-sibling::*)]",
			"not()":            _not,
			"nth-child()":      _nthChild,
			"nth-last-child()": _nthChild,
			"only-child":       "[not(preceding-sibling::*) and not(following-sibling::*)]",
			"root":             "[not(parent::*)]"
		}
	},
	
	"@opera": {	
		init: function() {
			this.optimised.pseudoClasses["last-child"] = this.values.pseudoClasses["last-child"];
			this.optimised.pseudoClasses["only-child"] = this.values.pseudoClasses["only-child"];
			this.base();
		}
	}
});

// these functions defined here to make the code more readable

function _not(match, args) {
	var parser = new XPathParser;
	return "[not(" + parser.exec(trim(args))
		.replace(/\[1\]/g, "") // remove the "[1]" introduced by ID selectors
		.replace(/^(\*|[\w-]+)/, "[self::$1]") // tagName test
		.replace(/\]\[/g, " and ") // merge predicates
		.slice(1, -1)
	+ ")]";
};

function _nthChild(match, args, position) {
	return "[" + Parser._nthChild(match, args, position || "count(preceding-sibling::*)+1", "last()", "not", " and ", " mod ", "=") + "]";
};

// =========================================================================
// DOM/selectors-api/xpath/Selector.js
// =========================================================================

// If the browser supports XPath then the CSS selector is converted to an XPath query instead.

Selector.implement({
	toXPath: function() {
		return Selector.toXPath(this);
	},
	
	"@(XPathResult)": {
		$evaluate: function(context, single) {
			// use DOM methods if the XPath engine can't be used
			if (Selector.$NOT_XPATH.test(this)) {
				return this.base(context, single);
			}
			var document = Traversal.getDocument(context);
			var type = single
				? 9 /* FIRST_ORDERED_NODE_TYPE */
				: 7 /* ORDERED_NODE_SNAPSHOT_TYPE */;
			var result = document.evaluate(this.toXPath(), context, null, type, null);
			return single ? result.singleNodeValue : result;
		}
	},
	
	"@MSIE": {
		$evaluate: function(context, single) {
			if (typeof context.selectNodes != "undefined" && !Selector.$NOT_XPATH.test(this)) { // xml
				var method = single ? "selectSingleNode" : "selectNodes";
				return context[method](this.toXPath());
			}
			return this.base(context, single);
		}
	}
});

extend(Selector, {
	xpathParser: null,
	
	toXPath: function(selector) {
		if (!this.xpathParser) this.xpathParser = new XPathParser;
		return this.xpathParser.parse(selector);
	},
	
	$NOT_XPATH: /:(checked|disabled|enabled|contains)|^(#[\w-]+\s*)?\w+$/,
	
	"@KHTML": { // XPath is just too buggy on earlier versions of Safari	
		$NOT_XPATH: /:(checked|disabled|enabled|contains)|^(#[\w-]+\s*)?\w+$|nth\-/,
		
		"@!WebKit5": {
			$NOT_XPATH: /./
		}
	}
});

// =========================================================================
// DOM/core/Node.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({	
	"@!(element.compareDocumentPosition)" : {
		compareDocumentPosition: function(node, other) {
			// http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
			
			if (Traversal.contains(node, other)) {
				return 4|16; // following|contained_by
			} else if (Traversal.contains(other, node)) {
				return 2|8; // preceding|contains
			}
			
			var nodeIndex = Node._getSourceIndex(node);
			var otherIndex = Node._getSourceIndex(other);
			
			if (nodeIndex < otherIndex) {
				return 4; // following
			} else if (nodeIndex > otherIndex) {
				return 2; // preceding
			}			
			return 0;
		}
	}
}, {
	_getSourceIndex: function(node) {
		// return a key suitable for comparing nodes
		var key = 0;
		while (node) {
			key = Traversal.getNodeIndex(node) + "." + key;
			node = node.parentNode;
		}
		return key;
	},
	
	"@(element.sourceIndex)": {	
		_getSourceIndex: function(node) {
			return node.sourceIndex;
		}
	}
});

// =========================================================================
// DOM/core/Document.js
// =========================================================================

var Document = Node.extend(null, {
	bind: function(document) {
		this.base(document);
		extend(document, "createElement", function(tagName) { //-dean- test this!
			return DOM.bind(this.base(tagName));
		});
		AbstractView.bind(document.defaultView);
		return document;
	},
	
	"@!(document.defaultView)": {
		bind: function(document) {
			document.defaultView = Traversal.getDefaultView(document);
			return this.base(document);
		}
	}
});

// provide these as pass-through methods
Document.createDelegate("createElement", 2);

// =========================================================================
// DOM/core/Element.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// I'm going to fix getAttribute() for IE here instead of HTMLElement.

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

var Element = Node.extend({
	"@MSIE[67]": {
		getAttribute: function(element, name, iFlags) {
			if (element.className === undefined || name == "href" || name == "src") {
				return this.base(element, name, 2);
			}
			var attribute = element.getAttributeNode(name);
			return attribute && attribute.specified ? attribute.nodeValue : null;
		}
	},
	
	"@MSIE5.+win": {
		getAttribute: function(element, name, iFlags) {
			if (element.className === undefined || name == "href" || name == "src") {
				return this.base(element, name, 2);
			}
			var attribute = element.attributes[this.$attributes[name.toLowerCase()] || name];
			return attribute ? attribute.specified ? attribute.nodeValue : null : this.base(element, name);
		}
	}
}, {
	$attributes: {},
	
	"@MSIE5.+win": {
		init: function() {
			// these are the attributes that IE is case-sensitive about
			// convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
			var attributes = "colSpan,rowSpan,vAlign,dateTime,accessKey,tabIndex,encType,maxLength,readOnly,longDesc";
			// combine two arrays to make a hash
			var keys = attributes.toLowerCase().split(",");
			var values = attributes.split(",");
			this.$attributes = Array2.combine(keys, values);
		}
	}
});

Element.createDelegate("setAttribute", 3);

// =========================================================================
// DOM/implementations.js
// =========================================================================

AbstractView.implement(ViewCSS);

Document.implement(DocumentSelector);
Document.implement(DocumentEvent);
Document.implement(EventTarget);

Element.implement(ElementSelector);
Element.implement(EventTarget);

// =========================================================================
// DOM/html/HTMLDocument.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
	// http://www.whatwg.org/specs/web-apps/current-work/#activeelement	
	"@(document.activeElement===undefined)": {
		bind: function(document) {
			this.base(document);
			document.activeElement = null;
			document.addEventListener("focus", function(event) { //-dean: is onfocus good enough?
				document.activeElement = event.target;
			}, false);
			return document;
		}
	}
});

// =========================================================================
// DOM/html/HTMLElement.js
// =========================================================================

// The className methods are not standard but are extremely handy. :-)

var HTMLElement = Element.extend({
	addClass: function(element, className) {
		if (!this.hasClass(element, className)) {
			element.className += (element.className ? " " : "") + className;
			return className;
		}
	},
	
	hasClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return regexp.test(element.className);
	},

	removeClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		element.className = element.className.replace(regexp, "$2");
		return className;
	}	
}, {
	bindings: {},
	tags: "*",
	
	extend: function() {
		// Maintain HTML element bindings.
		// This allows us to map specific interfaces to elements by reference
		// to tag name.
		var binding = base(this, arguments);
		var tags = (binding.tags || "").toUpperCase().split(",");
		forEach (tags, function(tagName) {
			HTMLElement.bindings[tagName] = binding;
		});
		return binding;
	},
	
	"@!(element.ownerDocument)": {
		bind: function(element) {
			this.base(element);
			element.ownerDocument = Traversal.getOwnerDocument(element);
			return element;
		}
	}
});

// =========================================================================
// DOM/init.js
// =========================================================================

// all other libraries allow this handy shortcut so base2 will too :-)

DOM.$ = function(selector, context) {
	return new Selector(selector).exec(context, 1);
};

DOM.$$ = function(selector, context) {
	return new Selector(selector).exec(context);
};

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

//--| Combine: ../../../lib/src/base2-io.js
// timestamp: Mon, 23 Jul 2007 07:37:57

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// IO/namespace.js
// =========================================================================

var IO = new base2.Namespace(this, {
	name:    "IO",
	version: "0.3",
	exports: "FileSystem,Directory,LocalFileSystem,LocalDirectory,LocalFile,JSONFileSystem,JSONDirectory"
});

eval(this.imports);

function NOT_SUPPORTED() {
	throw new Error("Not supported.");
}

// =========================================================================
// utils/XPCOM.js
// =========================================================================

// some useful methods for dealing with XPCOM

var XPCOM = new Base({
	privelegedMethod: K, // no such thing as priveleged for non-Mozilla browsers
	privelegedObject: K,
	
	"@(XPCOM)": {
		createObject: function(classPath, interfaceId) {
			try {
				var _class = Components.classes["@mozilla.org/" + classPath];
				var _interface = Components.interfaces[interfaceId];
				return _class.createInstance(_interface);
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
			return this.$nsILocalFile.has();
		},
		
		isFile: function(path) {
			return this.has() && this.$nsILocalFile.isFile();
		},
		
		isDirectory: function(path) {
			return this.has() && this.$nsILocalFile.isDirectory();
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
			return new java.io.File(path).has();
		}
	}
}, {
/*	init: function() {
		Base.forEach (this.prototype, function(method, name) {
			if (method instanceof Function && !/chdir|makepath/.test(name)) {
				this.extend(name, function(path) {
					return method.apply(this, arguments);
				});
			}
		}, this.prototype);
	}, */
	
	"@(Components)": { // XPCOM
		init: function() {
			XPCOM.privelegedObject(this.prototype);
		//-	this.base();
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
				this.put(files.item(i));
			}
		}
	},

	"@(Components)": { // XPCOM
		constructor: XPCOM.privelegedMethod(function(directory) {
			this.base();
			var enumerator = directory.QueryInterface(Components.interfaces.nsIDirectoryEnumerator);
			while (enumerator.hasMoreElements()) {
				this.put(enumerator.nextFile);
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
						if (!this.has()) {
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
			return this.$init().has();
		},

		open: function(mode) {
			if (!this.$stream) {
				this.base(mode);
				var file = this.$init();
				switch (this.mode) {
					case LocalFile.READ:
						if (!file.has()) {
							this.mode = LocalFile.CLOSED;
							break;
						}
						var $stream = XPCOM.createObject("network/file-input-stream;1", "nsIFileInputStream");
						$stream.init(file, 0x01, 00004, null);
						this.$stream = XPCOM.createObject("scriptableinputstream;1", "nsIScriptableInputStream");
						this.$stream.init($stream);
						break;
					case LocalFile.WRITE:
						if (!file.has()) file.create(0, 0664);
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
			return file.has();
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
		return new this(fileName).has();
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

var FETCH = "#" + Number(new Date);

var JSONFileSystem = FileSystem.extend({
	constructor: function(object) {
		this[FETCH] = function(path) {
			// fetch data from the JSON object, regardless of type
			path = this.makepath(path);
			return reduce(path.split("/"), function(file, name) {
				if (file && name) file = file[name];
				return file;
			}, object);
		};
	},
	
	exists: function(path) {
		return this[FETCH](path) !== undefined;
	},
	
	isFile: function(path) {
		return typeof this[FETCH](path) == "string";
	},
	
	isDirectory: function(path) {
		return typeof this[FETCH](path) == "object";
	},

	copy: function(path1, path2) {
		var data = this[FETCH](path1);
		this.write(path2, JSON.copy(data));
	},
	
	mkdir: function(path) {
		// create a directory
		this.write(path, {});
	},
	
	move: function(path1, path2) {
		var data = this[FETCH](path1);
		this.write(path2, data);
		this.remove(path1);
	},

	read: function(path) {		
		// read text from the JSON object
		var file = this[FETCH](path);
		return typeof file == "object" ?
			new JSONDirectory(file) : file || ""; // make read safe
	},
	
	remove: function(path) {
		// remove data from the JSON object
		path = path.replace(/\/$/, "").split("/");
		var filename = path.splice(path.length - 1, 1);
		var directory = this[FETCH](path.join("/"));
		if (directory) delete directory[filename];
	},

	write: function(path, data) {
		// write data to the JSON object
		path = path.split("/");
		var filename = path.splice(path.length - 1, 1);
		var directory = this[FETCH](path.join("/"));
		assert(directory, "Directory not found."); 
		return directory[filename] = data || "";
	}
});

// =========================================================================
// IO/JSONDirectory.js
// =========================================================================

var JSONDirectory = Directory.extend(null, {
	create: function(name, item) {
		if (!instanceOf(item, this.Item)) {
			item = new this.Item(name, typeof item == "object", item && item.length);
		}
		return item;
	}
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

//--| Combine: ../../../lib/src/base2-jsb.js
// timestamp: Mon, 23 Jul 2007 07:37:57

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/namespace.js
// =========================================================================

var JSB = new base2.Namespace(this, {
	name:    "JSB",
	version: "0.6",
	imports: "DOM",
	exports: "Binding,Rule,RuleList"
});

eval(this.imports);

// =========================================================================
// JSB/Binding.js
// =========================================================================

// Remember: a binding is a function

var Binding = Abstract.extend();

// =========================================================================
// JSB/Call.js
// =========================================================================

var Call = Base.extend({
	constructor: function(context, method, args, rank) {
		this.release = function() {
			method.apply(context, args);
		};
		this.rank = rank || (100 + Call.list.length);
	}
}, {
	list: [],
	
	defer: function(method, rank) {
		// defers a method call until DOMContentLoaded
		return function() {
			if (Call.list) {
				Call.list.push(new Call(this, method, arguments, rank));
			} else {
				method.apply(this, arguments);
			}
		};
	},
	
	init: function() {
		EventTarget.addEventListener(document, "DOMContentLoaded", function() {
			// release deferred calls
			if (Call.list) {
				DOM.bind(document);
				Call.list.sort(function(a, b) {
					return a.rank - b.rank;
				});
				invoke(Call.list, "release");
				delete Call.list;
				setTimeout(function() { // jump out of the current event
					EventTarget.dispatchEvent(document,'ready');
				}, 0);
			}
		}, false);
	}
});

// =========================================================================
// JSB/Rule.js
// =========================================================================

var Rule = Base.extend({
	constructor: function(selector, binding) {
		// create the selector object
		selector = new Selector(selector);
		// create the binding
		if (typeof binding != "function") {
			binding = Binding.extend(binding);
		}
		// create the bind function
		var bound = {}; // don't bind more than once
		function bind(element) {
			var uid = assignID(element);
			if (!bound[uid]) {
				bound[uid] = true;
				binding(DOM.bind(element));
			}
		};
		// execution of this method is deferred until the DOMContentLoaded event
		this.apply = Call.defer(function() {
			forEach (selector.exec(document), bind);
		});
		this.toString = partial(String, selector);
		this.apply();
	},
	
	apply: Undefined,
	
	refresh: function() {
		this.apply();
	}
});

// =========================================================================
// JSB/RuleList.js
// =========================================================================

// A collection of Rule objects

var RuleList = Collection.extend({
	constructor: function(rules) {
		this.base(rules);
		this.globalize(); //-dean: make this optional
	},
	
	globalize: Call.defer(function() {
		var COMMA = /\s*,\s*/;
		var ID = /^#[\w-]+$/;
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this, function(rule, selector) {
			// add all ID selectors to the global namespace
			forEach (selector.split(COMMA), function(selector) {
				if (ID.test(selector)) {
					var name = ViewCSS.toCamelCase(selector.slice(1));
					window[name] = Document.querySelector(document, selector);
				}
			});
		});
	}, 10),
	
	refresh: function() {
		this.invoke("refresh");
	}
}, {
	Item: Rule
});

// =========================================================================
// JSB/Event.js
// =========================================================================

extend(Event, {
	PATTERN: /^on(DOMContentLoaded|[a-z]+)$/,
	
	cancel: function(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
});

// =========================================================================
// JSB/EventTarget.js
// =========================================================================

extend(EventTarget, {
	addEventListener: function(target, type, listener, capture) {
		// Allow elements to pick up document events (e.g. ondocumentclick).
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			listener = bind(listener, target);
			target = Traversal.getDocument(target);
		}
		// call the default method
		this.base(target, type, listener, capture);
	},
	
/*	dispatchEvent: function(target, event) { 
		// Allow the event to be a string identifying its type.
		if (typeof event == "string") {
			var type = event;
			var document = Traversal.getDocument(target);
			event = document.createEvent("Events");
			event.initEvent(type, false, false);
		}
		this.base(target, event);
	}, */

	removeEventListener: function(target, type, listener, capture) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getDocument(target);
		}
		this.base(target, type, listener, capture);
	}
});

// =========================================================================
// JSB/HTMLElement.js
// =========================================================================

extend(HTMLElement.prototype, "extend", function(name, value) {
	if (!base2.__prototyping && arguments.length >= 2) {
		// automatically attach event handlers when extending
		if (Event.PATTERN.test(name) && typeof value == "function") {
			EventTarget.addEventListener(this, name.slice(2), value, false);
			return this;
		}
		// extend the style object
		if (name == "style") {
			extend(this.style, value);
			return this;
		}
		if (name == "extend") return this;
	}
	return base(this, arguments);
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

//--| Combine: ../../../lib/src/../../src/apps/packer/Packer.js
/*
	Packer version 3.1 (alpha 1) - copyright 2004-2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

eval(base2.namespace);

var IGNORE = RegGrp.IGNORE;
var REMOVE = "";
var SPACE = " ";
var WORDS = /\w+/g;

Packer = Base.extend({
	minify: function(script) {
		// packing with no additional options
		return this.pack(script);
	},
	
	pack: function(script, base62, shrink, privateVars) {
		script += "\n";
		script = script.replace(Packer.CONTINUE, "");
		script = Packer.comments.exec(script);
		script = Packer.clean.exec(script);
		if (shrink) script = this._shrinkVariables(script);
		script = Packer.whitespace.exec(script);
		if (shrink) script = Packer.clean.exec(script);
		if (privateVars) script = this._encodePrivateVariables(script);
		if (base62) script = this._base62Encode(script);
		return script;
	},
	
	_base62Encode: function(script, words) {
		var words = new Words(script);
		words.encode();
		
		/* build the packed script */
		
		var p = this._escape(words.exec(script));		
		var a = "[]";		
		var c = words.count() || 1;		
		var k = words.map(String).join("|").replace(/\|+$/, "");
		var e = Packer["ENCODE" + (c > 10 ? c > 36 ? 62 : 36 : 10)];
		var r = "{}";
		
		// the whole thing
		return format(Packer.UNPACK, p,a,c,k,e,r);
	},
	
	_encodePrivateVariables: function(script, words) {
		var index = 0;
		var encoded = {};
		Packer.privates.put("\\b_[A-Za-z\\d]\\w*\\b", function(id) {
			if (encoded[id] == null) encoded[id] = index++;
			return "_" + encoded[id];
		});
		return Packer.privates.exec(script);
	},
	
	_escape: function(script) {
		// Single quotes wrap the final string so escape them.
		// Also, escape new lines (required by conditional comments).
		return script.replace(/([\\'])/g, "\\$1").replace(/[\r\n]+/g, "\\n");
	},
	
	_shrinkVariables: function(script) {
		// Windows Scripting Host cannot do regexp.test() on global regexps.
		var global = function(regexp) {
			// This function creates a global version of the passed regexp.
			return new RegExp(regexp.source, "g");
		};
		
		var data = []; // encoded strings and regular expressions
		var REGEXP = /^[^'"]\//;
		var store = function(string) {
			var replacement = "#" + data.length;
			if (REGEXP.test(string)) {
				replacement = string.charAt(0) + replacement;
				string = string.slice(1);
			}
			data.push(string);
			return replacement;
		};
		
		// Base52 encoding (a-Z)
		var encode52 = function(c) {
			return (c < 52 ? '' : arguments.callee(parseInt(c / 52))) +
				((c = c % 52) > 25 ? String.fromCharCode(c + 39) : String.fromCharCode(c + 97));
		};
				
		// identify blocks, particularly identify function blocks (which define scope)
		var BLOCK =       /((catch|do|if|while|with|function)\b\s*[^~{;]*\s*(\(\s*[^{;]*\s*\))\s*)?(\{([^{}]*)\})/;
		var BLOCK_g =     global(BLOCK);
		var BRACKETS =    /\{[^{}]*\}|\[[^\[\]]*\]|\([^\(\)]*\)|~[^~]+~/;
		var BRACKETS_g =  global(BRACKETS);
		var ENCODED =     /~#?(\d+)~/;
		var SCOPED  =     /~#(\d+)~/;
		var VARS =        /\bvar\s+[\w$]+[^;]*|\bfunction\s+[\w$]+/g;
		var VAR_TIDY =    /\b(var|function)\b|\sin\s+[^;]+/g;
		var VAR_EQUAL =   /\s*=[^,;]*/g;
		var LIST =        /[^\s,;]+/g;
		
		var blocks = []; // store program blocks (anything between braces {})
		// encoder for program blocks
		var encode = function($, prefix, blockType, args, block) {
			if (!prefix) prefix = "";
			switch (blockType) {
				case "function":
					// decode the function block (THIS IS THE IMPORTANT BIT)
					// We are retrieving all sub-blocks and will re-parse them in light
					// of newly shrunk variables
					block = args + decode(block, SCOPED);
					prefix = prefix.replace(BRACKETS, "");
					
					// create the list of variable and argument names
					args = args.slice(1, -1);
					vars = match(block, VARS).join(";");
					while (BRACKETS.test(vars)) {
						vars = vars.replace(BRACKETS_g, "");
					}
					vars = vars.replace(VAR_TIDY, "").replace(VAR_EQUAL, "");
					
					block = decode(block, ENCODED);
					
					// process each identifier
					var count = 0, shortId;
					var ids = match([args, vars], LIST);
					for (var i = 0; i < ids.length; i++) {
						id = ids[i];
						if (id.length > 1) { // > 1 char
							id = rescape(id);
							// find the next free short name (check everything in the current scope)
							do shortId = encode52(count++);
							while (new RegExp("[^\\w$.@]" + shortId + "[^\\w$:@]").test(block));
							// replace the long name with the short name
							var reg = new RegExp("([^\\w$.@])" + id + "([^\\w$:@])");
							while (reg.test(block)) {
								block = block.replace(global(reg), "$1" + shortId + "$2");
							}
							var reg = new RegExp("([^{,\\w$.])" + id + ":", "g");
							block = block.replace(reg, "$1" + shortId + ":");
						}
					}
					break;
				default:
					// remove unnecessary braces
				//	if (/do|else|else\s+if|if|while|with/.test(blockType) && !/[;~]/.test(block)) {
				//		block = " " + block.slice(1, -1) + ";";
				//	}
			}
			blockType = (blockType == "function") ? "" : "#";
			var replacement = "~" + blockType + blocks.length + "~";
			blocks.push(prefix + block);
			return replacement;
		};
		
		// decoder for program blocks
		var decode = function(script, encoded) {
			while (encoded.test(script)) {
				script = script.replace(global(encoded), function(match, index) {
					return blocks[index];
				});
			}
			return script;
		};
		
		// encode strings and regular expressions
		script = Packer.data.exec(script, store);
		
		// remove closures (this is for base2 namespaces only)
		script = script.replace(/new function\(_\)\s*\{/g, "{;#;");
		
		// encode blocks, as we encode we replace variable and argument names
		while (BLOCK.test(script)) {
			script = script.replace(BLOCK_g, encode);
		}
		
		// put the blocks back
		script = decode(script, ENCODED);
		
		// put back the closure (for base2 namespaces only)
		script = script.replace(/\{;#;/g, "new function(_){");
		
		// put strings and regular expressions back
		script = script.replace(/#(\d+)/g, function(match, index) {		
			return data[index];
		});
		
		return script;
	}
}, {
	CONTINUE: /\\\r?\n/g,
	
	ENCODE10: "String",
	ENCODE36: "function(c){return c.toString(36)}",
	ENCODE62: "function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)>35?String.fromCharCode(c+29):c.toString(36))}",
			
	UNPACK: "eval(function(p,a,c,k,e,r){var b,e=%5;if(!''.replace(/^/,String)){while(c--)a[c]=(r[b=e(c)]=k[c])?" +
	        "b:'\\\\x0';e=function(){return a.join('|')||'^'};k=[function(e){return r[e]}];c=1};while(c--)if(k[c])p=p." +
			"replace(new RegExp('\\\\b('+e(c)+')\\\\b','g'),k[c]);return p}('%1',%2,%3,'%4'.split('|'),0,{}));",
	
	init: function() {
		this.data = this.build(this.data);
		this.comments = this.data.union(this.build(this.comments));
		this.privates = this.build(this.privates);
		this.clean = this.data.union(this.clean);
		this.whitespace = this.data.union(this.whitespace);
		eval("var e=this.encode62=" + this.ENCODE62);
	},
	
	build: function(group) {
		return reduce(group, function(data, replacement, expression) {
			data.put(this.javascript.exec(expression), replacement);
			return data;
		}, new RegGrp, this);
	},
	
	clean: {
		"\\(\\s*;\\s*;\\s*\\)": "(;;)", // for (;;) loops
		"throw[^};]+[};]": IGNORE, // a safari 1.3 bug
		";+\\s*([};])": "$1"
	},
	
	comments: {
		"(COMMENT1)\\n\\s*(REGEXP)?": "\n$3",
		"(COMMENT2)\\s*(REGEXP)?": " $3"
	},
	
	privates: { // conditional comments
		"@\\w+": IGNORE,
		"\\w+@": IGNORE
	},
	
	data: {
		// strings
		"STRING1": IGNORE,
		'STRING2': IGNORE,
		"CONDITIONAL": IGNORE, // conditional comments
		"([\\[(\\^=,{}:;&|!*?])\\s*(REGEXP)": "$1$2"
	},
	
	javascript: new RegGrp({
		COMMENT1:    /(\/\/|;;;)[^\n]*/.source,
		COMMENT2:    /\/\*[^*]*\*+([^\/][^*]*\*+)*\//.source,
		CONDITIONAL: /\/\*@|@\*\/|\/\/@[^\n]*\n/.source,
		REGEXP:      /\/(\\[\/\\]|[^*\/])(\\.|[^\/\n\\])*\/[gim]*/.source,
		STRING1:     /'(\\.|[^'\\])*'/.source,
		STRING2:     /"(\\.|[^"\\])*"/.source
	}),
	
	whitespace: {
		"(\\d)\\s+(\\.\\s*[a-z\\$_\\[(])": "$1 $2", // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
		"([+-])\\s+([+-])": "$1 $2", // c = a++ +b;
		"\\b\\s+\\$\\s+\\b": " $ ", // var $ in
		"\\$\\s+\\b": "$ ", // object$ in
		"\\b\\s+\\$": " $", // return $object
		"\\b\\s+\\b": SPACE,
		"\\s+": REMOVE
	}
});

//--| Combine: ../../../lib/src/../../src/apps/packer/Words.js

var Words = RegGrp.extend({
	constructor: function(script) {
		this.base();		
		forEach (script.match(WORDS), this.add, this);
	},
	
	add: function(word) {
		if (!this.has(word)) {
			this.base(word);
		}
		word = this.get(word);
		word.count++;
		return word;
	},
	
	encode: function() {
		// sort by frequency
		this.sort(function(word1, word2) {
			return word2.count - word1.count;
		});
		
		var encode = Packer.encode62;		
		var encoded = new Collection; // a dictionary of base62 -> base10
		var count = this.count();
		for (var i = 0; i < count; i++) {
			encoded.put(encode(i), i);
		}
		
		var empty = partial(String, "");
		var index = 0;
		forEach (this, function(word) {
			if (encoded.has(word)) {
				word.index = encoded.get(word);
				word.toString = empty;
			} else {
				while (this.has(encode(index))) index++;
				word.index = index++;
				if (word.count == 1) {
					word.toString = empty;
				}
			}
			word.replacement = encode(word.index);
		}, this);
		
		// sort by encoding
		this.sort(function(word1, word2) {
			return word1.index - word2.index;
		});
		
		return this;
	},
	
	exec: function(script) {
		if (!this.count()) return script;
		var self = this;
		return script.replace(this.valueOf(), function(word) {
			return self["#" + word].replacement;
		});
	},
	
	toString: function() {
		var words = this.map(String).join("|").replace(/\|{2,}/g, "|").replace(/^\|+|\|+$/g, "") || "\\x0";
		return "\\b(" + words + ")\\b";
	}
}, {
	Item: {
		count: 0,
		encoded: "",
		index: -1
	}
});
