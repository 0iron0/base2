
// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
	implement: function(_interface) {		
		if (typeof _interface == "object") {
			forEach (_interface, function(source, name) {
				if (name.charAt(0) == "@") {
					forEach (source, arguments.callee, this);
				} else if (!this[name] && typeof source == "function") {
					this.createDelegate(name, source.length);
				}
			}, this);
		}
		return this.base(_interface);
	},
	
	createDelegate: function(name, length) {
		// delegate a static method to the bound object
		//  e.g. for most browsers:
		//    EventTarget.addEventListener(element, type, listener, capture) 
		//  forwards to:
		//    element.addEventListener(type, listener, capture)
		if (!this[name]) {
			var FN = "var fn=function _%1(%2){%3.base=%3.%1.ancestor;var m=%3.base?'base':'%1';return %3[m](%4)}";
			var args = "abcdefghij".split("").slice(-length);
			eval(format(FN, name, args, args[0], args.slice(1)));
			this[name] = fn;
		}
	}
});
