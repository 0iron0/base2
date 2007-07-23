
// http://dean.edwards.name/weblog/2006/03/base/

function Base() {
	if (this.constructor == Base) {
		this.extend(arguments[0]);
	} else {
		return extend(arguments[0], Base.prototype);
	}
};

Base.prototype = {
	constructor: Base,

	base: function() {
		// Call this method from any other method to invoke the current method's ancestor (super).
	},
	
	extend: delegate(extend)	
};

Base.ancestor = Object;

Base.ancestorOf = delegate(_ancestorOf);

Base.base = Base.prototype.base;

Base.extend = function(_instance, _static) {
	// Build the prototype.
	base2.__prototyping = true;
	var _prototype = new this;
	extend(_prototype, _instance);
	delete base2.__prototyping;
	
	// Create the wrapper for the constructor function.
	var _constructor = _prototype.constructor;
	function klass() {
		if (!base2.__prototyping) { // Don't call the constructor function when prototyping.
			if (this.constructor == arguments.callee || this.__constructing) {
				// Instantiation.
				this.__constructing = true;
				_constructor.apply(this, arguments);
				delete this.__constructing;
			} else {
				// Cast.
				return extend(arguments[0], _prototype);
			}
		}
	};
	_prototype.constructor = klass;
	
	// Build the static interface.
	for (var i in Base) klass[i] = this[i];
	klass.ancestor = this;
	klass.base = Undefined;
	klass.init = Undefined;
	klass.prototype = _prototype;
	extend(klass, _static);
	klass.init();
	return klass;
};
	
Base.forEach = delegate(_Function_forEach),

Base.implement = function(source) {
	if (instanceOf(source, Function)) {
		// If we are implementing another classs/module then we can use
		// casting to apply the interface.
		if (Base.ancestorOf(source)) {
			source(this.prototype);
		}
	} else {
		// Add the interface using the extend() function.
		extend(this.prototype, source);
	}
	return this;
};

Base.init = Undefined;
