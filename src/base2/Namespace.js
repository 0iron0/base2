
var Namespace = Base.extend({
	constructor: function(_private, _public) {
		this.base(_public);
		this.toString = function() {
			return format("[base2.%1]", this.name);
		};
		
		// initialise
		if (typeof this.init == "function") this.init();
		
		if (this.name != "base2") {
			this.namespace = format("var %1=base2.%1;", this.name);
		}
		
		var namespace = "var base=" + base + ";";
		var imports = ("base2,lang," + this.imports).split(",");
		_private.imports = Enumerable.reduce(imports, namespace, function(namespace, name) {
			if (base2[name]) namespace += base2[name].namespace;
			return namespace;
		});
		
		var namespace = format("base2.%1=%1;", this.name);
		var exports = this.exports.split(",");
		_private.exports = Enumerable.reduce(exports, namespace, function(namespace, name) {
			if (name) {
				this.namespace += format("var %2=%1.%2;", this.name, name);
				namespace += format("if(!%1.%2)%1.%2=%2;base2.%2=%1.%2;", this.name, name);
			}
			return namespace;
		}, this);
	},

	exports: "",
	imports: "",
	namespace: "",
	name: ""
});

base2 = new Namespace(this, {
	exports: "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace",
	name: "base2",
	version: "0.7 (alpha)"
});

base2.toString = function() {
	return "[base2]";
};

eval(this.exports);
