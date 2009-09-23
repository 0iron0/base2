
// JavaScript Templates

/*
  Based on the work of Erik Arvidsson:
  
    http://erik.eae.net/archives/2005/05/27/01.03.26/
*/

var jst = new base2.Package(this, {
  name:    "jst",
  version: base2.version,
  exports: "Command,Environment,Interpreter,Parser"
});

eval(this.imports);
