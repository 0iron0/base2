
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

var $id = 1;
var assignID = function(object) {
	// assign a unique id
	if (!object.base2ID) object.base2ID = "b2_" + $id++;
	return object.base2ID;
};

var bind = function(method, context) {
	var bound = function() {
		return method.apply(context, arguments);
	};
	bound.cloneID = assignID(method);
	return bound;
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
			return object.join && object.splice && typeof object == "object";
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

var LTRIM = /^\s\s*/;
var RTRIM = /\s\s*$/; // http://blog.stevenlevithan.com/archives/faster-trim-javascript
var trim = function(string) {
	return String(string).replace(LTRIM, "").replace(RTRIM, "");
};
