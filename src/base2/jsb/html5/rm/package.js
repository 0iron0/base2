
var rm = new base2.Package(this, {
  name:    "rm",
  version: "0.1",
  imports: "Function2,DOM,jsb",
  exports: "template,add,remove,moveup,movedown",
  parent:  jsb
});

eval(this.imports);
