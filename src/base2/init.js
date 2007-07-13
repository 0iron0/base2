
base2 = new Namespace(this, {
	name:    "base2",
	version: "0.9 (alpha)",
	exports: "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace," +
		"K,assert,assertType,assignID,bind,copy,extend,format,forEach,instanceOf,match,rescape,slice,trim"
});

// add the Enumerable methods to the base2 object
forEach (Enumerable, function(method, name) {
	if (!Module[name]) base2.addName(name, method);
});
base2.extend = extend;

eval(this.exports);
