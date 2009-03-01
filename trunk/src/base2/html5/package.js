
var html5 = base2.global.html5 = new base2.Package(this, {
  name:    "html5",
  version: "0.1",
  imports: "Function2,DOM,jsb",
  exports: "element,template"
});

eval(this.imports);
