
var doc = new base2.Package(this, {
  name:    "doc",
  version: "0.5",

  colorize: function(text) {
    return Colorizer.javascript.exec(text);
  }
});

eval(this.imports);
