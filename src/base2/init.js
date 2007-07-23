
base2.exports = "Base,Abstract,Module,Enumerable,Array2,Hash,Collection,RegGrp,Namespace," +
	"K,Undefined,assert,assertArity,assertType,assignID,base,bind,copy,delegate,detect,extend,forEach,format,instanceOf,match,partial,rescape,slice,trim,unbind";

base2 = new Namespace(this, base2);
eval(this.exports);

base2.base = base;
base2.extend = extend;

forEach (Enumerable, function(method, name) {
	if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});
