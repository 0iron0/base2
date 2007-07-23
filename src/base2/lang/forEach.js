
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
