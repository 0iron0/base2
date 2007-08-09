
var JavaScript = new base2.Namespace(this, {
  name:    "JavaScript",
  version: "0.6",
  exports: "Array2, Date2, String2",
  
  bind: function(global) {
    forEach (this.exports.split(","), function(name) {
      this[name](global[name]);
    });
  }
});

eval(this.imports);
