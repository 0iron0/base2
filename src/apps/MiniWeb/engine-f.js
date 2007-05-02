// timestamp: Wed, 02 May 2007 04:28:53
/*
	base2.js - copyright 2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

var base2 = {};

// You know, writing a javascript library is awfully time consuming.

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// base2/Base.js
// =========================================================================

// version 1.1

var Base = function() {
	// call this method from any other method to invoke that method's ancestor
};

Base.prototype = {	
	extend: function(source) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			var value = arguments[1];
			if (typeof value == "function" && ancestor && /\bbase\b/.test(value)) {
				var method = value;				
				value = function() { // override
					var previous = this.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				value.method = method;
				value.ancestor = ancestor;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			if (Base._prototyping) {
				var key, i = 0, members = ["constructor", "toString", "valueOf"];
				while (key = members[i++]) if (source[key] != Object.prototype[key]) {
					extend.call(this, key, source[key]);
				}
			} else if (typeof this != "function") {
				// if the object has a customised extend() method then use it
				extend = this.extend || extend;
			}			
			// copy each of the source object's properties to this object
			for (key in source) if (!Object.prototype[key]) {
				extend.call(this, key, source[key]);
			}
		}
		return this;
	},

	base: Base
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else { // casting
				var object = arguments[0];
				if (object != null) {
					(object.extend || extend).call(object, proto);
				}
				return object;
			}
		}
	};
	
	// build the class interface
	for (var i in Base) klass[i] = this[i];
	klass.ancestor = this;
	klass.base = Base.base;
	klass.prototype = proto;
	klass.toString = this.toString;
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	base: Base,
	
	implement: function(_interface) {
		if (typeof _interface == "function") {
			// if it's a function, call it
			_interface(this.prototype);
		} else {
			// add the interface using the extend() method
			this.prototype.extend(_interface);
		}
		return this;
	}
});

// =========================================================================
// lang/main.js
// =========================================================================

var Legacy = typeof $Legacy == "undefined" ? {} : $Legacy;

var K = function(k) {return k};

var assert = function(condition, message, Err) {
	if (!condition) {
		throw new (Err || Error)(message || "Assertion failed.");
	}
};

var assertType = function(object, type, message) {
	if (type) {
		var condition = typeof type == "function" ? instanceOf(object, type) : typeof object == type;
		assert(condition, message || "Invalid type.", TypeError);
	}
};

var copy = function(object) {
	var fn = new Function;
	fn.prototype = object;
	return new fn;
};

var format = function(string) {
	// replace %n with arguments[n]
	// e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
	// ==> "she sells sea shells"
	// only supports nine replacements: %1 - %9
	var args = arguments;
	return String(string).replace(/%([1-9])/g, function(match, index) {
		return index < args.length ? args[index] : match;
	});
};

var $instanceOf = Legacy.instanceOf || new Function("o,k", "return o instanceof k");
var instanceOf = function(object, klass) {
	assertType(klass, "function", "Invalid 'instanceOf' operand.");
	if ($instanceOf(object, klass)) return true;
	// handle exceptions where the target object originates from another frame
	//  this is handy for JSON parsing (amongst other things)
	if (object != null) switch (klass) {
		case Object:
			return true;
		case Number:
		case Boolean:
		case Function:
		case String:
			return typeof object == typeof klass.prototype.valueOf();
		case Array:
			// this is the only troublesome one
			return !!(object.join && object.splice && !arguments.callee(object, Function));
		case Date:
			return !!object.getTimezoneOffset;
		case RegExp:
			return String(object.constructor.prototype) == String(new RegExp);
	}
	return false;
};
	
var match = function(string, expression) {
	// same as String.match() except that this function will return an empty 
	// array if there is no match
	return String(string).match(expression) || [];
};

var RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;
var rescape = function(string) {
	// make a string safe for creating a RegExp
	return String(string).replace(RESCAPE, "\\$1");
};

var $slice = Array.prototype.slice;
var slice = function(object) {
	// slice an array-like object
	return $slice.apply(object, $slice.call(arguments, 1));
};

var TRIM = /^\s+|\s+$/g;
var trim = function(string) {
	return String(string).replace(TRIM, "");	
};

// =========================================================================
// lang/extend.js
// =========================================================================

var base = function(object, args) {
	// invoke the base method with all supplied arguments
	return object.base.apply(object, args);
};

var extend = function(object) {
	assert(object != Object.prototype, "Object.prototype is verboten!");
	return Base.prototype.extend.apply(object, slice(arguments, 1));
};

// =========================================================================
// lang/assignID.js
// =========================================================================

var $ID = 1;
var assignID = function(object) {
	// assign a unique id
	if (!object.base2ID) object.base2ID = "b2_" + $ID++;
	return object.base2ID;
};

// =========================================================================
// lang/forEach.js
// =========================================================================

if (typeof StopIteration == "undefined") {
	StopIteration = new Error("StopIteration");
}

var forEach = function(object, block, context) {
	if (object == null) return;
	if (typeof object == "function") {
		// functions are a special case
		var fn = Function;
	} else if (typeof object.forEach == "function" && object.forEach != arguments.callee) {
		// the object implements a custom forEach method
		object.forEach(block, context);
		return;
	} else if (typeof object.length == "number") {
		// the object is array-like
		forEach.Array(object, block, context);
		return;
	}
	forEach.Function(fn || Object, object, block, context);
};

// these are the two core enumeration methods. all other forEach methods
//  eventually call one of these two.

forEach.Array = function(array, block, context) {
	var i, length = array.length; // preserve
	if (typeof array == "string") {
		for (i = 0; i < length; i++) {
			block.call(context, array.charAt(i), i, array);
		}
	} else {
		for (i = 0; i < length; i++) {
			block.call(context, array[i], i, array);
		}
	}
};

forEach.Function = Legacy.forEach || function(fn, object, block, context) {
	// enumerate an object and compare its keys with fn's prototype
	for (var key in object) {
		if (fn.prototype[key] === undefined) {
			block.call(context, object[key], key, object);
		}
	}
};

// =========================================================================
// base2/Base/forEach.js
// =========================================================================

Base.forEach = function(object, block, context) {
	forEach.Function(this, object, block, context);
};

// =========================================================================
// base2/../Function.js
// =========================================================================

// some browsers don't define this

Function.prototype.prototype = {};


// =========================================================================
// base2/../String.js
// =========================================================================

// fix String.replace (Safari/IE5.0)

if ("".replace(/^/, String)) {
	extend(String.prototype, "replace", function(expression, replacement) {
		if (typeof replacement == "function") { // Safari doesn't like functions
			if (instanceOf(expression, RegExp)) {
				var regexp = expression;
				var global = regexp.global;
				if (global == null) global = /(g|gi)$/.test(regexp);
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
		} else {
			return base(this, arguments);
		}
	});
}

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

// based on ruby's Module class and Mozilla's Array generics:
//   http://www.ruby-doc.org/core/classes/Module.html
//   http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics

// A Module is used as the basis for creating interfaces that can be
// applied to other classes. *All* properties and methods are static.
// When a module is used as a mixin, methods defined on what would normally be
// the instance interface become instance methods of the target object.

// Modules cannot be instantiated. Static properties and methods are inherited.

var Module = Abstract.extend(null, {
	extend: function(_interface, _static) {
		// extend a module to create a new module
		var module = this.base();
		// inherit static methods
		forEach (this, function(property, name) {
			if (!Module[name] && name != "init") {
				extend(module, name, property);
			}
		});
		// implement module (instance AND static) methods
		module.implement(_interface);
		// implement static properties and methods
		extend(module, _static);
		// Make the submarine noises Larry!
		if (typeof module.init == "function") module.init();
		return module;
	},
	
	implement: function(_interface) {
		// implement an interface on BOTH the instance and static interfaces
		var module = this;
		if (typeof _interface == "function") {
			module.base(_interface);
			forEach (_interface, function(property, name) {
				if (!Module[name] && name != "init") {
					extend(module, name, property);
				}
			});
		} else {
			// create the instance interface
			Base.forEach (extend({}, _interface), function(property, name) {
				// instance methods call the equivalent static method
				if (typeof property == "function") {
					property = function() {
						base; // force inheritance
						return module[name].apply(module, [this].concat(slice(arguments)));
					};
				}
				if (!Module[name]) extend(this, name, property);
			}, module.prototype);
			// add the static interface
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
		return this.reduce(object, function(result, value, key) {
			if (test.call(context, value, key, object)) {
				result[result.length] = value;
			}
			return result;
		}, new Array2);
	},

	invoke: function(object, method) {
		// apply a method to each item in the enumerated object
		var args = slice(arguments, 2);
		return this.map(object, (typeof method == "function") ? function(item) {
			if (item != null) return method.apply(item, args);
		} : function(item) {
			if (item != null) return item[method].apply(item, args);
		});
	},
	
	map: function(object, block, context) {
		var result = new Array2;
		this.forEach (object, function(value, key) {
			result[result.length] = block.call(context, value, key, object);
		});
		return result;
	},
	
	pluck: function(object, key) {
		return this.map(object, function(item) {
			if (item != null) return item[key];
		});
	},
	
	reduce: function(object, block, result, context) {
		this.forEach (object, function(value, key) {
			result = block.call(context, result, value, key, object);
		});
		return result;
	},
	
	some: function(object, test, context) {
		return !this.every(object, function(value, key) {
			return !test.call(context, value, key, object);
		});
	}
}, {
	forEach: forEach
});

// =========================================================================
// base2/Array2.js
// =========================================================================

// The IArray module implements all Array methods.
// This module is not public but its methods are accessible through the Array2 object (below). 

var IArray = Module.extend({
	combine: function(keys, values) {
		// combine two arrays to make a hash
		if (!values) values = keys;
		return this.reduce(keys, function(object, key, index) {
			object[key] = values[index];
			return object;
		}, {});
	},
	
	copy: function(array) {
		return this.concat(array);
	},
	
	contains: function(array, item) {
		return this.indexOf(array, item) != -1;
	},
	
	forEach: forEach.Array,
	
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
	
	insertBefore: function(array, item, before) {
		var index = this.indexOf(array, before);
		if (index == -1) this.push(array, item);
		else this.splice(array, index, 0, item);
		return item;
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
	
	remove: function(array, item) {
		var index = this.indexOf(array, item);
		if (index != -1) this.removeAt(array, index);
		return item;
	},
	
	removeAt: function(array, index) {
		var item = array[index];
		this.splice(array, index, 1);
		return item;
	}
});

IArray.prototype.forEach = function(block, context) {
	forEach.Array(this, block, context);
};

IArray.implement(Enumerable);

forEach ("concat,join,pop,push,reverse,shift,slice,sort,splice,unshift".split(","), function(name) {
	IArray[name] = function(array) {
		return Array.prototype[name].apply(array, slice(arguments, 1));
	};
});

// create a faux constructor that augments the built-in Array object
var Array2 = function() {
	return IArray(this.constructor == IArray ? Array.apply(null, arguments) : arguments[0]);
};
// expose IArray.prototype so that it can be extended
Array2.prototype = IArray.prototype;

forEach (IArray, function(method, name, proto) {
	if (Array[name]) {
		IArray[name] = Array[name];
		delete IArray.prototype[name];
	}
	Array2[name] = IArray[name];
});

// =========================================================================
// base2/Hash.js
// =========================================================================

var HASH = "#" + Number(new Date);
var KEYS = HASH + "keys";
var VALUES = HASH + "values";

var Hash = Base.extend({
	constructor: function(values) {
		this[KEYS] = new Array2;
		this[VALUES] = {};
		this.merge(values);
	},

	copy: function() {
		var copy = new this.constructor(this);
		Base.forEach (this, function(property, name) {
			if (typeof property != "function" && name.charAt(0) != "#") {
				copy[name] = property;
			}
		});
		return copy;
	},

	// ancient browsers throw an error when we use "in" as an operator 
	//  so we must create the function dynamically
	exists: Legacy.exists || new Function("k", format("return('%1'+k)in this['%2']", HASH, VALUES)),

	fetch: function(key) {
		return this[VALUES][HASH + key];
	},

	forEach: function(block, context) {
		forEach (this[KEYS], function(key) {
			block.call(context, this.fetch(key), key, this);
		}, this);
	},

	keys: function(index, length) {
		var keys = this[KEYS] || new Array2;
		switch (arguments.length) {
			case 0: return keys.copy();
			case 1: return keys[index];
			default: return keys.slice(index, length);
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
		var value = this.fetch(key);
		this[KEYS].remove(String(key));
		delete this[VALUES][HASH + key];
		return value;
	},

	store: function(key, value) {
		if (arguments.length == 1) value = key;
		// only store the key for a new entry
		if (!this.exists(key)) {
			this[KEYS].push(String(key));
		}
		// create the new entry (or overwrite the old entry)
		this[VALUES][HASH + key] = value;
		return value;
	},

	toString: function() {
		return String(this[KEYS]);
	},

	union: function(values) {
		return this.merge.apply(this.copy(), arguments);
	},

	values: function(index, length) {
		var values = this.map(K);
		switch (arguments.length) {
			case 0: return values;
			case 1: return values[index];
			default: return values.slice(index, length);
		}
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
// e.g.
//     var Dates = Collection.extend();                 // create a collection class
//     Dates.Item = Date;                               // only JavaScript Date objects allowed as members
//     var appointments = new Dates();                  // instantiate the class
//     appointments.add(appointmentId, new Date);       // add a date
//     appointments.add(appointmentId, "tomorrow");     // ERROR!

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, store, insertAt, replaceAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var Collection = Hash.extend({
	add: function(key, item) {
		// Duplicates not allowed using add().
		//  - but you can still overwrite entries using store()
		assert(!this.exists(key), "Duplicate key.");
		return this.store.apply(this, arguments);
	},

	count: function() {
		return this[KEYS].length;
	},

	indexOf: function(key) {
		return this[KEYS].indexOf(String(key));
	},

	insertAt: function(index, key, item) {
		assert(!this.exists(key), "Duplicate key.");
		this[KEYS].insertAt(index, String(key));
		return this.store.apply(this, slice(arguments, 1));
	},

	item: function(index) {
		return this.fetch(this[KEYS][index]);
	},

	removeAt: function(index) {
		return this.remove(this[KEYS][index]);
	},

	reverse: function() {
		this[KEYS].reverse();
		return this;
	},

	sort: function(compare) {
		if (compare) {
			var self = this;
			this[KEYS].sort(function(key1, key2) {
				return compare(self.fetch(key1), self.fetch(key2), key1, key2);
			});
		} else this[KEYS].sort();
		return this;
	},

	store: function(key, item) {
		if (arguments.length == 1) item = key;
		item = this.constructor.create.apply(this.constructor, arguments);
		return this.base(key, item);
	},

	storeAt: function(index, item) {
		//-dean: get rid of this?
		assert(index < this.count(), "Index out of bounds.");
		arguments[0] = this[KEYS][index];
		return this.store.apply(this, arguments);
	}
}, {
	Item: null, // if specified, all members of the Collection must be instances of Item
	
	create: function(key, item) {
		if (this.Item && !instanceOf(item, this.Item)) {
			item = new this.Item(key, item);
		}
		return item;
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
		if (typeof klass.init == "function") klass.init();
		return klass;
	}
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

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

	exec: function(string, replacement) {
		if (arguments.length == 1) {
			var keys = this[KEYS];
			var values = this[VALUES];
			replacement = function(match) {
				if (!match) return "";
				var offset = 1, i = 0;
				// loop through the values
				while (match = values[HASH + keys[i++]]) {
					// do we have a result?
					if (arguments[offset]) {
						var replacement = match.replacement;
						switch (typeof replacement) {
							case "function":
								return replacement.apply(null, slice(arguments, offset));
							case "number":
								return arguments[offset + replacement];
							default:
								return replacement;
						}
					// no? then skip over references to sub-expressions
					} else offset += match.length + 1;
				}
			};
		}
		var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
		return String(string).replace(new RegExp(this, flags), replacement);
	},

	test: function(string) {
		return this.exec(string) != string;
	},
	
	toString: function() {
		var length = 0;
		return "(" + this.map(function(item) {
			// fix back references
			var expression = String(item).replace(/\\(\d+)/g, function($, index) {
				return "\\" + (1 + Number(index) + length);
			});
			length += item.length + 1;
			return expression;
		}).join(")|(") + ")";
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
	}
});

// =========================================================================
// base2/RegGrp/Item.js
// =========================================================================

RegGrp.Item = Base.extend({
	constructor: function(expression, replacement) {
		var ESCAPE = /\\./g;
		var STRING = /(['"])\1\+(.*)\+\1\1$/;
	
		expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
		
		if (typeof replacement == "number") replacement = String(replacement);
		else if (replacement == null) replacement = "";
		
		// count the number of sub-expressions
		//  - add one because each pattern is itself a sub-expression
		this.length = match(expression.replace(ESCAPE, "").replace(/\[[^\]]+\]/g, ""), /\(/g).length;
		
		// does the pattern use sub-expressions?
		if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
			// a simple lookup? (e.g. "$2")
			if (/^\$\d+$/.test(replacement)) {
				// store the index (used for fast retrieval of matched strings)
				replacement = parseInt(replacement.slice(1));
			} else { // a complicated lookup (e.g. "Hello $2 $1")
				// build a function to do the lookup
				var i = this.length + 1;
				var Q = /'/.test(replacement.replace(ESCAPE, "")) ? '"' : "'";
				replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
					"+(arguments[$1]||" + Q+Q + ")+" + Q);
				replacement = new Function("return " + Q + replacement.replace(STRING, "$1") + Q);
			}
		}
		this.replacement = replacement;
		this.toString = function() {
			return expression || "";
		};
	},
	
	length: 0,
	replacement: ""
});

// =========================================================================
// base2/Namespace.js
// =========================================================================

var Namespace = Base.extend({
	constructor: function(_private, _public) {
		this.extend(_public);
		this.toString = function() {
			return format("[base2.%1]", this.name);
		};
		
		// initialise
		if (typeof this.init == "function") this.init();
		
		if (this.name != "base2") {
			this.namespace = format("var %1=base2.%1;", this.name);
		}
		
		var namespace = "var base=" + base + ";";
		var imports = ("base2,lang," + this.imports).split(",");
		_private.imports = Enumerable.reduce(imports, function(namespace, name) {
			if (base2[name]) namespace += base2[name].namespace;
			return namespace;
		}, namespace);
		
		var namespace = format("base2.%1=%1;", this.name);
		var exports = this.exports.split(",");
		_private.exports = Enumerable.reduce(exports, function(namespace, name) {
			if (name) {
				this.namespace += format("var %2=%1.%2;", this.name, name);
				namespace += format("if(!%1.%2)%1.%2=%2;base2.%2=%1.%2;", this.name, name);
			}
			return namespace;
		}, namespace, this);
		
		if (this.name != "base2") {
			base2.namespace += format("var %1=base2.%1;", this.name);
		}
	},

	exports: "",
	imports: "",
	namespace: "",
	name: ""
});

base2 = new Namespace(this, {
	name:    "base2",
	version: "0.8 (alpha)",
	exports: "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace"
});

base2.toString = function() {
	return "[base2]";
};

eval(this.exports);

// =========================================================================
// base2/lang/namespace.js
// =========================================================================

var lang = new Namespace(this, {
	name:    "lang",
	version: base2.version,
	exports: "K,assert,assertType,assignID,copy,instanceOf,extend,format,forEach,match,rescape,slice,trim",
	
	init: function() {
		this.extend = extend;
		// add the Enumerable methods to the lang object
		forEach (Enumerable.prototype, function(method, name) {
			if (!Module[name]) {
				this[name] = function() {
					return Enumerable[name].apply(Enumerable, arguments);
				};
				this.exports += "," + name;
			}
		}, this);
	}
});

eval(this.exports);

base2.namespace += lang.namespace;

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// BOM/object.js
// =========================================================================

// browser specific code

var element = document.createElement("span");
var jscript/*@cc_on=@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164

var BOM = {
	userAgent: "",

	init: function() {
		var MSIE/*@cc_on=true@*/;
		// initialise the user agent string
		var userAgent = navigator.userAgent;
		// fix opera's (and others) user agent string
		if (!MSIE) userAgent = userAgent.replace(/MSIE\s[\d.]+/, "");
		// close up the space between name and version number
		//  e.g. MSIE 6 -> MSIE6
		userAgent = userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
		this.userAgent = navigator.platform + " " + userAgent;
	},

	detect: function(test) {
		var r = false;
		var not = test.charAt(0) == "!";
		test = test
			.replace(/^\!?(if\s*|platform\s+)?/, "")
			.replace(/^(["']?)([^\(].*)(\1)$/, "/($2)/i.test(BOM.userAgent)");
		try {
			eval("r=!!" + test);
		} catch (error) {
			// the test failed
		}
		return Boolean(not ^ r);
	}
};

// =========================================================================
// BOM/namespace.js
// =========================================================================

// browser specific code
base2.extend(BOM, {
	name:    "BOM",
	version: "0.9",
	exports: "detect,Window"
});
BOM = new base2.Namespace(this, BOM);

eval(this.imports);

// =========================================================================
// BOM/Base.js
// =========================================================================

var _extend = Base.prototype.extend;
Base.prototype.extend = function(source, value) {
	if (typeof source == "string" && source.charAt(0) == "@") {
		return BOM.detect(source.slice(1)) ? _extend.call(this, value) : this;
	}
	return _extend.apply(this, arguments);
};

// =========================================================================
// BOM/MSIE.js
// =========================================================================

// avoid memory leaks

if (BOM.detect("MSIE.+win")) {
	var $closures = {}; // all closures stored here
	
	BOM.$bind = function(method, element) {
		if (!element || element.nodeType != 1) {
			return method;
		}
		
		// unique id's for element and function
		var $element = element.uniqueID;
		var $method = assignID(method);
		
		// store the closure in a manageable scope
		$closures[$method] = method;			
		if (!$closures[$element]) $closures[$element] = {};		
		var closure = $closures[$element][$method];
		if (closure) return closure; // already stored
		
		// reset pointers
		element = null;
		method = null;
		
		// return a new closure with a manageable scope 
		var bound = function() {
			var element = document.all[$element];
			if (element) return $closures[$method].apply(element, arguments);
		};
		bound.cloneID = $method;
		$closures[$element][$method] = bound;
		return bound;
	};
	
	attachEvent("onunload", function() {
		$closures = null; // closures are destroyed when the page is unloaded
	});
}

// =========================================================================
// BOM/Window.js
// =========================================================================

var Window = Module.extend(null, {
	verify: function(window) {
		return (window && window.Infinity) ? window : null;
	},
	
	"@MSIE": {
		verify: function(window) {
			// A very weird bug...
			return (window == self) ? self : this.base();
		}
	}
});

eval(this.exports);

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
	version: "0.4",
	exports: "Command,Interpreter,Parser"
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
		var evaluate = function(match) {
			match = match.replace(Parser.TRIM, "");
			if (!match) return "";
			if (match.charAt(0) == "=") {
				match = "\necho(" + match.replace(TRIM, "") + ");";
			}
			var replacement = "\x01" + evaluated.length;
			evaluated.push(match);
			return replacement;
		};
		return Parser.TEXT.exec(this.escape(string).replace(BLOCK, evaluate));
	}
}, {
	ESCAPE: /\\|\"|\n|\r/g,
	EVALUATED: /\x01(\d+)/g,
	TEXT: new RegGrp({
		"\\x01\\d+": RegGrp.IGNORE,
		"[^\\x01]+": function(match) {
			return '\necho("' + Parser.escape(match) + '");';
		}
	}),
	TRIM: /^<%\-\-.*\-\-%>$|^<%\s*|\s*%>$/g,
	
	escape: function(string) {
		return string.replace(this.ESCAPE, this.format);
	},
	
	format: function(chr) {
		switch (chr) {
			case "\\": return "\\\\";
			case "\"": return "\\\"";
			case "\n": return "\\n";
			case "\r": return "\\r";
		}
	}
});

Parser.implement(Escape);

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSON/namespace.js
// =========================================================================

// This code is loosely based on Douglas Crockford's original:
//	http://www.json.org/json.js

// This is not a particularly great implementation. I hacked it together to
//  support another project. It seems to work well enough though.

var JSON = new base2.Namespace(this, {
	name:    "JSON",
	version: "0.4",
	
	VALID: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/,
	
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
			if (name != "Object" && instanceOf(property.prototype, Module) && instanceOf(object, window[name])) {
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
		return "{" + reduce(object, function(properties, property, name) {
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
	toJSONString: function(boolean) {
		return String(boolean);
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
		return '"' + date.getFullYear() + "-" +
			pad(date.getMonth() + 1) + "-" +
			pad(date.getDate()) + "T" +
			pad(date.getHours()) + ":" +
			pad(date.getMinutes()) + ":" +
			pad(date.getSeconds()) + '"';
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
		return '"' + this.escape(string) + '"';
	}
}, {
	CTRL_CHAR: /[\x00-\x1f\\"]/g,
	ESCAPE: {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	},
	
	escape: function(string) {
		var ESCAPE = this.ESCAPE;
		return String(string).replace(this.CTRL_CHAR, function(match) {
			var chr = ESCAPE[match];
			if (chr) return chr;
			chr = match.charCodeAt(0);
			return '\\u00' + Math.floor(chr / 16).toString(16) + (chr % 16).toString(16);
		});
	}
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// IO/namespace.js
// =========================================================================

var IO = new base2.Namespace(this, {
	name:    "IO",
	version: "0.3",
	exports: "FileSystem,Directory,LocalFileSystem,LocalDirectory,LocalFile,JSONFileSystem,JSONDirectory",
	
	NOT_SUPPORTED: function() {
		throw new Error("Not supported.");
	}
});

eval(this.imports);

// =========================================================================
// IO//base2/BOM/XPCOM.js
// =========================================================================

// some useful methods for dealing with XPCOM

var XPCOM = new Base({
	privelegedMethod: K, // no such thing as priveleged for non-Mozilla browsers
	privelegedObject: K,
	
	"@(Components)": {
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
		
	copy: IO.NOT_SUPPORTED,
	exists: IO.NOT_SUPPORTED,
	isDirectory: IO.NOT_SUPPORTED,
	isFile: IO.NOT_SUPPORTED,
	mkdir: IO.NOT_SUPPORTED,
	move: IO.NOT_SUPPORTED,
	read: IO.NOT_SUPPORTED,
	remove: IO.NOT_SUPPORTED,
	write: IO.NOT_SUPPORTED
}, {
	resolve: function(path1, path2) {
		var FILENAME = /[^\/]+$/;
		var RELATIVE = /\/[^\/]+\/\.\./g;
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

	"@(ActiveXObject)": { // ActiveX
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

	"@(java && navigator.javaEnabled() && !window.Components)": { // java
		exists: function(path) {
			return new java.io.File(path).exists();
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
	"@(ActiveXObject)": { // ActiveX
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
			if (!instanceOf(file, this.Item)) {
				file = new this.Item(file.Name, file.Type | 16, file.Size);
			}
			return file;
		}
	},

	"@(Components)": {
		create: function(name, file) {
			if (!instanceOf(file, this.Item)) {
				file = new this.Item(file.leafName, file.isDirectory(), file.fileSize);
			}
			return file;
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

	exists: IO.NOT_SUPPORTED,
	read: IO.NOT_SUPPORTED,
	remove: IO.NOT_SUPPORTED,
	write: IO.NOT_SUPPORTED,

	"@(ActiveXObject)": { // ActiveX
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
			// why does this 'enablePrivilege' have to be here?
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

	"@(java && navigator.javaEnabled() && !window.Components)": { // Java
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
			var CRLF = "\r\n";
			var text = "";
			var line;
			while ((line = this.$stream.readLine()) != null) {
				text += (line + CRLF);
			}
			return text;
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
		path = Array2(path.replace(/\/$/, "").split("/"));
		var filename = path.removeAt(path.length - 1);
		var directory = this[FETCH](path.join("/"));
		if (directory) delete directory[filename];
	},

	write: function(path, data) {
		// write data to the JSON object
		path = Array2(path.split("/"));
		var filename = path.removeAt(path.length - 1);
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
	exports: "Request",
	imports: "IO",
	version: "0.5",
	
	DOCTYPE: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
	SCRIPT: '<script type="text/javascript">%1<\/script>',
	
	client: null,
	data: null,
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
		} else {
			// update the revision number of the document
			var REVISION = "/system/About/revision";
			var io = this.server.io;
			var revision = parseInt(io.read(REVISION));
			io.write(REVISION, String(++revision));
			
			// save the state of the terminal
			if (!name) Terminal.save(this.terminal);
		
			// stringify JSON data
			var json = "MiniWeb.data=" + JSON.toString(this.data).replace(/<\//g, "<\\/");
			
			// the source of the MiniWeb engine
			var src = document.getElementsByTagName("script")[0].src;
			
			// it's mostly script :-)
			var html = [
				this.DOCTYPE,
				"<head>",
				"<title>" + document.title + "<\/title>",
				format('<script type="text/javascript" src="%1"><\/script>', src),
				format(this.SCRIPT, json),
				"<body>"
			].join("\n");
			
			if (!name) LocalFile.backup(location.pathname);
			LocalFile.write(name || location.pathname, html);
			if (!name) location.reload();
			return true;
		}
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
				link.className = "mw-visited";
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
	//-	var scrollTop = this.scrollTop = {};
		
		var hash;
		this.timer = setInterval(function() {
			if (hash != location.hash) {
				hash = location.hash;
				callback();
			//-	document.documentElement.scrollTop = scrollTop[hash];
			}
		}, 20);
		
	/*	// preserve scroll position
		window.onscroll = function() {
			if (hash == location.hash) {
				scrollTop[hash] = document.documentElement.scrollTop;
			}
		}; */
		
		this.add(location.hash || "#/");
	},
	
	timer: 0,
	visited: null,
	
	add: function(hash) {
		if (location.hash != hash) {
			location.hash = hash;
		}
	//-	this.scrollTop[hash] = 0;
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
		if (!location.hash) location.replace("#/");
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
		return new Interpreter(request).interpret();
	},
	
	respond: function(request, data) {
		// repsond to a client request
	//	try {
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
	//	} catch (error) {
	//		request.error = error;
	//		request.status = 500; // Internal Server Error
	//	} finally {
			if (request.method != "HEAD" && request.status > 299) { // return an error page
				request.responseText = this.interpret(request);
			}
			request.readyState = 4; // Loaded
	//	}
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
//-	statusText: "",  // don't bother with this one
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
//  So far they are:
//      JSON (js:)
//      Local file system (file:)

var FileSystem = JSONFileSystem.extend({
	constructor: function() {
		this.base(MiniWeb.data);
	},
	
	remove: function(path) {
		MiniWeb.dirty = true;
		return this.base(path);
	},
	
	write: function(path, data) {
		MiniWeb.dirty = true;
		return this.base(path, data);
	},
	
	protocol: "json:" /*
}, {
	protocols: new Hash,
	
	init2: function() { //-dean
		var protocols = this.protocols;
		Base.forEach (this.prototype, function(method, name) {
			if (typeof method == "function" && !/chdir/.test(name)) {
				this[name] = function() {
					var protocol = protocols.fetch(this.protocol);
					protocol.path = this.path;
					var result = protocol[name].apply(protocol, arguments);
					this.path = protocol.path;
					return result;
				};
			}
		}, this.prototype);
	} */
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
		forEach (String(names).split(/\s*,\s*/), function(name, index) {
			if (name) this[name] = args[index];
		}, this);
		return args;
	},
	
	escapeHTML: function(string) {
		return Command.HTML_ESCAPE.exec(string);
	},
	
	exec: function(template, target) {
		// defined in the constructor function
	},
	
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
					this.process(template, path + target);
				}
			}, this);
		} else {
			target = this.makepath(target);
			this.echo(this.exec(template, target));
		}
		// process remaining arguments
		forEach (slice(arguments, 2), function(target) {
			this.process(template, target);
		}, this);
	}
	
/*	set: function(name, value) {
		// set a property of this object
		//  it will effectively become a global variable
		if (Command.prototype[name] === undefined) {
			this[name] = value;
		}
	},
	
	unset: function(name) {
		if (Command.prototype[name] === undefined) {
			delete this[name];
		}
	} */
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

// The interpreter provides access to the request object and its post data.
// It also has access to a copy of the client's request object.

var Interpreter = Command.extend({
	constructor: function(request) {
		this.base();
		this.request = copy(request);
		//this.config = MiniWeb.data.system.config;
	},
	
//	config: null,
	query: "",
	request: null,
	
/*	interpret: function() {
		var template = Interpreter.VIEW;
		var target = this.request.url;
		var status = this.request.status;
		
		if (status > 299) { // return an error page
			target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
		} else { // find a template
			if (target.indexOf("!") != -1) {
				target = target.split("!");
				this.query = target[1];
				target = target[0];
			}
			if (target == Interpreter.CREATE || target == Interpreter.EDIT || target == template) { // yuk!
				template = target;
				target = this.query;
			} else {
				// find a template
				var path = target.split("/");
				do {
					path.pop();
					template = path.join("/") + Interpreter.VIEW;
				} while (path.length && !this.exists(template));
				if (this.isDirectory(target) && this.exists(target + Interpreter.DEFAULT)) {
					target += Interpreter.DEFAULT;
				}
			}
		}
		return this.exec(template, target);
	}, */
	
	interpret: function() {
		var url = this.request.url;
		var template = Interpreter.VIEW;
		var target = url;
		var status = this.request.status;
		
		if (status > 299) { // return an error page
			target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
		} else { // find a template
			if (url.indexOf("!") != -1) {
				url = url.split("!");
				template = url[0];
				target = this.query = url[1];
			} else {
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
		}
		return this.exec(template, target);
	}
}, {
	DEFAULT:   "default",
	VIEW:       "/system/view",
//	EDIT:      "/system/edit",
//	CREATE:    "/system/create",
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
// MiniWeb//base2/DOM/html/HTMLFormElement.js
// =========================================================================

var HTMLFormElement = HTMLElement.extend({
	serialize: function(form) {
		return filter(form.elements, HTMLFormItem.isSuccessful).map(HTMLFormItem.serialize).join("&");
	}
}, {
	tags: "FORM"
});

// =========================================================================
// MiniWeb//base2/DOM/html/HTMLFormItem.js
// =========================================================================

var HTMLFormItem = HTMLElement.extend(null, {
	tags: "BUTTON,INPUT,SELECT,TEXTAREA",
	
	isSuccessful: function(element) {
		if (!element.name || element.disabled) return false;
		switch (element.type) {
			case "button":
			case "reset":
				return false;
			case "radio":
			case "checkbox":
				return element.checked;
			case "image":
			case "submit":
				return element == document.activeElement;
			default:
				return true;
		}
	},
	
	serialize: function(element) {
		return element.name + "=" + encodeURIComponent(element.value);
	}
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
