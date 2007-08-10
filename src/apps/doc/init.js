
var LIST = /[^\s,]+/g;

base2["#name"] = "base2";
forEach (base2.exports.match(LIST), function(name) {
  var property = this[name];
  if (property instanceof Function || property instanceof Namespace) {
    property["#name"] = this["#name"] + "." + name;
    if (property instanceof Namespace) {
      forEach (property.exports.match(LIST), arguments.callee, property);
      forEach (property, function(klass, name) {
        if (Base.ancestorOf(klass) && !klass['#name']) {
          klass['#name'] = property['#name'] + "." + name;
        }
      });
    } else if (Module.ancestorOf(property)) {
      forEach(property["#implements"], function(module) {
        forEach (module, function(method, name) {
          if (!Module[name] && instanceOf(method, Function) && property[name]) {
            property[name]._module = module;
          }
        });
      });
    }
  }
}, base2);
