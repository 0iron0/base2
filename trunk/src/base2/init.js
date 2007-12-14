
base2 = new Package(this, base2);
eval(this.exports);

base2.extend = extend;

// the enumerable methods are extremely useful so we'll add them to the base2
//  namespace for convenience
forEach (Enumerable, function(method, name) {
  if (!Module[name]) base2.addName(name, bind(method, Enumerable));
});

JavaScript = new Package(this, JavaScript);
eval(this.exports);
