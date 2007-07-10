
var Module = Abstract.extend(null, {
	extend: function(_interface, _static) {
		// extend a module to create a new module
		var module = this.base();
		// inherit static methods
		forEach (this, function(property, name) {
			if (!Module[name] && name != "init") {
				extend(module, name, property);
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
	
	implement: function(_interface) {
		// implement an interface on BOTH the instance and static interfaces
		var module = this;
		if (typeof _interface == "function") {
			module.base(_interface);
			forEach (_interface, function(property, name) {
				if (!Module[name] && name != "init") {
					extend(module, name, property);
				}
			});
		} else {
			// create the instance interface
			Base.forEach (extend({}, _interface), function(property, name) {
				// instance methods call the equivalent static method
				if (typeof property == "function") {
					property = function() {
						base; // force inheritance
						return module[name].apply(module, [this].concat(slice(arguments)));
					};
				}
				if (!Module[name]) extend(this, name, property);
			}, module.prototype);
			// add the static interface
			extend(module, _interface);
		}
		return module;
	}
});
