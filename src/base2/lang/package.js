
var lang = new Package(this, {
	exports: "K,assert,assertType,instanceOf,extend,format,forEach,match,rescape,slice,trim",
	name: "lang",
	
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
lang.publish(base2);
