
var lang = new Namespace(this, {
	name:    "lang",
	version: base2.version,
	exports: "K,assert,assertType,assignID,bind,copy,extend,format,forEach,instanceOf,match,rescape,slice,trim",
	
	init: function() {
		this.extend = extend;
		// add the Enumerable methods to the lang object
		forEach (Enumerable.prototype, function(method, name) {
			if (!Module[name]) {
				this[name] = function() {
					return Enumerable[name].apply(Enumerable, arguments);
				};
				this.exports += "," + name;
			}
		}, this);
	}
});

eval(this.exports);

base2.namespace += lang.namespace;
