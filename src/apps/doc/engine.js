// timestamp: Thu, 09 Aug 2007 07:19:19

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// doc/namespace.js
// =========================================================================

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

// =========================================================================
// doc/data.js
// =========================================================================

doc.data = new Base({
  PATH: "/data/doc/entries/",
  
  exists: function(objectID, entry) {
    return MiniWeb.server.io.exists(this.makepath(objectID, entry));
  },

  makepath: function(objectID, entry) {
    return this.PATH + objectID.replace(/::/, '.prototype.').split('.').join('/') + '/#' + entry;
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

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
