
var LocalDirectory = Directory.extend({
  "@(ActiveXObject)": {
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var directory = _activex_exec("GetFolder", path);
        forEach ([directory.SubFolders, directory.Files], function(list) {
          var enumerator = new Enumerator(list);
          while (!enumerator.atEnd()) {
            var file = enumerator.item();
            this.put(file.Name, file);
            enumerator.moveNext();
          }
        }, this);
      }
    }
  },

  "@(Components)": { // XPCOM
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var file = _xpcom_createFile(path);
        var directory = file.directoryEntries;
        var enumerator = directory.QueryInterface(Components.interfaces.nsIDirectoryEnumerator);
        while (enumerator.hasMoreElements()) {
          file = enumerator.nextFile;
          this.put(file.leafName, file);
        }
      }
    }
  },

  "@(java && !global.Components)": {
    constructor: function(path) {
      this.base();
      
      if (typeof path == "string") {
        var file = _java_createFile(path);
        var directory = file.list();
        for (var i = 0; i < directory.length; i++) {
          file = new java.io.File(directory[i]);
          this.put(file.getName(), file);
        }
      }
    }
  }
}, {
  "@(ActiveXObject)": {
    create: function(name, file) {
      return new this.Item(name, file.Type | 16, file.Size);
    }
  },

  "@(Components)": {
    create: function(name, file) {
      return new this.Item(name, file.isDirectory(), file.fileSize);
    }
  },

  "@(java && !global.Components)": {
    create: function(name, file) {
      return new this.Item(name, file.isDirectory(), file.length());
    }
  }
});
