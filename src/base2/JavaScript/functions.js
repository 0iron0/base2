
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
