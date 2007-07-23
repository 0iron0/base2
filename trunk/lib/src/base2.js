// timestamp: Mon, 23 Jul 2007 07:37:56
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
		forEach (arguments, function(values) {
			forEach (values, function(value, key) {
				this.store(key, value);
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
	},
	
	init: function() {
		this.prototype.item = this.prototype.fetchAt;
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
	
		map: function(object, block, context) {
			var result = [];
			this.forEach (object, function(value, item) {
				result[index] = block.call(context, item, index, object);
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
	assertType(klass, "function", "Invalid 'instanceOf' operand.");
	
	// Ancient browsers throw an error when we use "instanceof" as an operator.
	/*@cc_on @*/
	/*@if (@_jscript_version < 5.1)
		if ($Legacy.instanceOf(object, klass)) return true;
	@else @*/
		if (object instanceof klass) return true;
	/*@end @*/
	
	// Handle exceptions where the target object originates from another frame
	// this is handy for JSON parsing (amongst other things).
	if (object != null) switch (klass) {
		case Array: // this is the only troublesome one
			return !!(object.join && object.splice && typeof object == "object");
		case RegExp:
			return typeof object.source == "string" && typeof object.ignoreCase == "boolean";
		case Function:
			return !!(typeof object == "function" && object.call);
		case Date:
			return !!object.getTimezoneOffset;
		case String:
		case Number:
		case Boolean:
			return typeof object == typeof klass.prototype.valueOf();
		case Object:
			return true;
	}
	return false;
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
