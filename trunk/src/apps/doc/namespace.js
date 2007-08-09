
var doc = new base2.Namespace(this, {
  name: "doc",

  colorize: function(text) {
    return Colorizer.javascript.exec(text);
  }
});

eval(this.imports);

var LIST = /[^\s,]+/g;

base2["#name"] = "base2";
forEach (base2.exports.match(LIST), function(name) {
  var property = this[name];
  if (property instanceof Function || property instanceof Namespace) {
    property["#name"] = this["#name"] + "." + name;
    if (property instanceof Namespace) {
      forEach (property.exports.match(LIST), arguments.callee, property);
    }
  }
}, base2);
