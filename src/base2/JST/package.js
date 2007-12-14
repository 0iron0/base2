
// JavaScript Templates

/*
  Based on the work of Erik Arvidsson:
    http://erik.eae.net/archives/2005/05/27/01.03.26/
*/

var JST = new base2.Package(this, {
  name:    "JST",
  version: "0.9.2",
  exports: "Command, Environment, Interpreter, Parser"
});

eval(this.imports);
