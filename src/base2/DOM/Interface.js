
// The DOM.Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
	createDelegate: function(name) {
		// delegate a static method to the bound object
		//  e.g. for most browsers:
		//    EventTarget.addEventListener(element, type, func, capture) 
		//  forwards to:
		//    element.addEventListener(type, func, capture)
		this[name] = function(object) {
			return (object[name].ancestor || object[name]).apply(object, slice(arguments, 1));
		};
	},
	
	extend: function(_interface, _static) {
		// extend a module to create a new module
		var module = this.base();
		// implement delegates
		forEach (_interface, function(source, name) {
			if (typeof source == "function" && !module[name]) {
				module.createDelegate(name);
			} else if (name.charAt(0) == "@") {
				forEach (source, arguments.callee);
			}
		});
		// implement module (instance AND static) methods
		module.implement(_interface);
		// implement static properties and methods
		extend(module, _static);
		// Make the submarine noises Larry!
		if (typeof module.init == "function") module.init();
		return module;
	},
	
	"@!(element.addEventListener.apply)": {
		createDelegate: function(name) {
			// can't invoke Function.apply on COM object methods. Shame.
			//  (this is also required for Safari)
			this[name] = function(object) {
				var method = (object.base && object.base == object[name].ancestor) ? "base" : name;
				// unroll for speed
				switch (arguments.length) {
					case 1: return object[method]();
					case 2: return object[method](arguments[1]);
					case 3: return object[method](arguments[1], arguments[2]);
					case 4: return object[method](arguments[1], arguments[2], arguments[3]);
				}
				// use eval() if there are lots of arguments
				var args = [], i = arguments.length;
				while (i-- > 1) args[i - 1] = "arguments[" + i + "]";
				eval("var returnValue=object[method](" + args + ")");
				return returnValue;
			};
		}
	}
});
