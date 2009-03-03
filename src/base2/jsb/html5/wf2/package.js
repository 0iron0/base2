
var wf2 = new base2.Package(this, {
  name:    "wf2",
  version: "0.1",
  imports: "Function2,DOM,jsb",
  exports: "button,datalist,form,input,output",
  parent:  base2.jsb
});

eval(this.imports);
