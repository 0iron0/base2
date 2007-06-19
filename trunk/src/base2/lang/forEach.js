
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
	// enumerate an object and compare its keys with fn's prototype
	for (var key in object) {
		if (fn.prototype[key] === undefined) {
			block.call(context, object[key], key, object);
		}
	}
};

// fix enumeration for Safari 1.2/3 (grrr)
var Temp = function(){this.i=1};
Temp.prototype = {i:1};
var count = 0;
for (var property in new Temp) count++;
if (count > 1) {
	forEach.Function = function(fn, object, block, context) {
		var processed = {};
		for (var key in object) {
			if (!processed[key] && fn.prototype[key] === undefined) {
				processed[key] = true;
				block.call(context, object[key], key, object);
			}
		}
	};
}
