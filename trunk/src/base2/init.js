
base2 = new Namespace(this, base2);
eval(this.exports);

base2.extend = extend;

forEach (Enumerable, function(method, name) {
  if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});
