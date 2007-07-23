
var Namespace = Base.extend({
	constructor: function(_private, _public) {
		this.extend(_public);
		
		// Initialise.
		if (typeof this.init == "function") this.init();
		
		if (this.name != "base2") {
			base2.addName(this.name, this);
			this.namespace = format("var %1=base2.%1;", this.name);
		}
		
		var LIST = /[^\s,]+/g; // pattern for comma separated list
		
		// This string should be evaluated immediately after creating a Namespace object.
		_private.imports = Array2.reduce(this.imports.match(LIST), function(namespace, name) {
			assert(base2[name], format("Namespace not found: '%1'.", name));
			return namespace += base2[name].namespace;
		}, base2.namespace);
		
		// This string should be evaluated after you have created all of the objects
		// that are being exported.
		_private.exports = Array2.reduce(this.exports.match(LIST), function(namespace, name) {
			this.namespace += format("var %2=%1.%2;", this.name, name);
			return namespace += format("if(!%1.%2)%1.%2=%2;", this.name, name);
		}, "", this);
	},

	exports: "",
	imports: "",
	namespace: "",
	name: "",
	
	addName: function(name, value) {
		this[name] = value;
		this.exports += "," + name;
		this.namespace += format("var %1=%2.%1;", name, this.name);
	}
});

