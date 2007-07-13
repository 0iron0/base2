
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

var $instanceOf = Legacy.instanceOf || new Function("o,k", "return o instanceof k");
var $RegExp = String(new RegExp);
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
		case String:
			return typeof object == typeof klass.prototype.valueOf();
		case Function:
			return !!(typeof object == "function" && object.call);
		case Array:
			// this is the only troublesome one
			return !!(object.join && object.splice && typeof object == "object");
		case Date:
			return !!object.getTimezoneOffset;
		case RegExp:
			return String(object.constructor.prototype) == $RegExp;
	}
	return false;
};
