
function _createObject2(Native, generics, extensions) {
	var INative = Module.extend();
	forEach (extensions, INative.implement, INative);
	forEach (generics.split(","), function(name) {
		// http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
		var method = Native.prototype[name];
		INative[name] = function(object) {
			return method.apply(object, slice(arguments, 1));
		};
	});
	
	// create a faux constructor that augments the built-in object
	var Native2 = function() {
		return INative(this.constructor == INative ? Native.apply(null, arguments) : arguments[0]);
	};
	
	forEach (INative, function(method, name) {
		if (Native[name]) {
			INative[name] = Native[name];
			delete INative.prototype[name];
		}
		Native2[name] = INative[name];
	});
	
	// expose INative.prototype so that it can be extended
	Native2.prototype = INative.prototype;
	
	return Native2;
};
