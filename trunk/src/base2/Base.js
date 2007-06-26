
// version 1.1

var Base = function() {
	// call this method from any other method to invoke that method's ancestor
};

Base.prototype = {
	extend: function(source) {
		if (arguments.length > 1) { // extending with a name/value pair
			var value = arguments[1];
			var ancestor = this[source];
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
				var members = ["constructor", "toString", "valueOf"];
				var key, i = 0;
				while (key = members[i++]) if (source[key] != Object.prototype[key]) {
					extend.call(this, key, source[key]);
				}
			} else if (typeof this != "function") {
				// if this object has a customised extend() method then use it
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
