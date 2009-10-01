/*
  base2 - copyright 2007-2009, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php

  Contributors:
    Doeke Zanstra
*/

// timestamp: Thu, 01 Oct 2009 14:12:38

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// doc/package.js
// =========================================================================

var doc = new base2.Package(this, {
  name:    "doc",
  version: "0.5",
  
  show: {},

  colorize: function(text) {
    return Colorizer.javascript.exec(text);
  }
});

eval(this.imports);

// =========================================================================
// doc/data.js
// =========================================================================

doc.data = new Base({
  PATH: "/data/doc/entries/",
  
  exists: function(objectID, entry) {
    return MiniWeb.server.io.exists(this.makepath(objectID, entry));
  },

  makepath: function(objectID, entry) {
    return this.PATH + String(objectID).replace(/::/, '.prototype.').split('.').join('/') + '/#' + entry;
  },

  read: function(objectID, entry) {
    return MiniWeb.server.io.read(this.makepath(objectID, entry));
  },

  remove: function(objectID, entry) {
    return MiniWeb.server.io.remove(this.makepath(objectID, entry));
  },
  
  write: function(objectID, entry, value) {
    var io = MiniWeb.server.io;
    var names = objectID.replace(/::/, '.prototype.').split('.');
    for (var i = 1; i <= names.length; i++) {
      var path = this.PATH + names.slice(0, i).join('/');
      if (!io.isDirectory(path)) {
        io.mkdir(path);
      }
    }
    io.write(path + '/#' + entry, value);
  }
});

// =========================================================================
// doc/init.js
// =========================================================================

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
      forEach (property["#implements"], function(module) {
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

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
