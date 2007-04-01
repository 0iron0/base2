
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

forEach.Function = function(fn, object, block, context) {
	// enumerate object and compare its keys with fn's prototype
	for (var key in object) {
		if (fn.prototype[key] === undefined) {
			block.call(context, object[key], key, object);
		}
	}
};
