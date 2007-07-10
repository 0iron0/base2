
if (typeof StopIteration == "undefined") {
	StopIteration = new Error("StopIteration");
}

var forEach = function(object, block, context) {
	if (object == null) return;
	if (instanceOf(object, Function)) { // test object.call because of a Safari bug
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

var $forEach = Legacy.forEach || new Function("a,b,c", "var i,d=a.length;for(i=0;i<d;i++)if(i in a)b.call(c,a[i],i,a)");
forEach.Array = function(array, block, context) {
	var i, length = array.length; // preserve
	if (typeof array == "string") {
		for (i = 0; i < length; i++) {
			block.call(context, array.charAt(i), i, array);
		}
	} else if (instanceOf(array, Array)) {
		// cater for sparse arrays
		$forEach(array, block, context);
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

// fix enumeration for Safari (grr)
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
