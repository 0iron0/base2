
var Namespace = Base.extend({
	constructor: function(_private, _public) {
		this.extend(_public);
		
		// initialise
		if (typeof this.init == "function") this.init();
		
		if (this.name != "base2") {
			this.namespace = format("var %1=base2.%1;", this.name);
		}
		
		var namespace = "var base=" + base + ";";
		var imports = ("base2," + this.imports).split(",");
		_private.imports = Array2.reduce(imports, function(namespace, name) {
			if (base2[name]) namespace += base2[name].namespace;
			return namespace;
		}, namespace);
		
		var namespace = format("base2.%1=%1;", this.name);
		var exports = this.exports.split(",");
		_private.exports = Array2.reduce(exports, function(namespace, name) {
			if (name) {
				this.namespace += format("var %2=%1.%2;", this.name, name);
				namespace += format("if(!%1.%2)%1.%2=%2;", this.name, name);
			}
			return namespace;
		}, namespace, this);
		
		if (this.name != "base2") {
			base2.namespace += format("var %1=base2.%1;", this.name);
		}
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

