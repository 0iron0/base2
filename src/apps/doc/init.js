
var LIST = /[^\s,]+/g;

base2["#name"] = "base2";
window["#name"] = "global";

forEach (base2.exports.match(LIST), function(name) {
  var property = this[name];
  if (property instanceof Function || property instanceof Package) {
    property["#name"] = this["#name"] + "." + name;
    if (property instanceof Package) {
      doc.show[name] = true;
      property.imports = property.imports.split(",").join(", ");
      property.exports = property.exports.split(",").join(", ");
      forEach (property.exports.match(LIST), arguments.callee, property);
      forEach (property, function(klass, name) {
        if (Base.ancestorOf(klass) && !klass['#name']) {
          klass['#name'] = property['#name'] + "." + name;
        }
      });
    } else if (Module.ancestorOf(property)) {
      forEach(property["#implements"], function(module) {
        forEach (module, function(method, name) {
          if (!Module[name] && typeOf(method) == "function" && property[name]) {
            property[name]._module = module;
          }
        });
      });
    } else if (Collection.ancestorOf(property)) {
      var Item = property.Item;
      if (Item && !Item["#name"]) {
        Item['#name'] = property['#name'] + ".Item";
      }
    }
  }
}, base2);

base2.exports = base2.exports.split(",").join(", ");
