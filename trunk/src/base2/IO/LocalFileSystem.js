
var LocalFileSystem = FileSystem.extend({
  constructor: function(path) {
    this.path = LocalFileSystem.getPath();
    this.base(path);
  },

  backup: function(path, extension) {
    if (this.isFile(path)) {
      if (!extension) extension = ".backup";
      this.write(path + extension, this.read(path));
    }
  },
  
  read: function(path) {
    if (this.isDirectory(path)) {
      return new LocalDirectory(this.makepath(path));
    } else {
      var file = new LocalFile(this.makepath(path));
      file.open(READ);
      var text = file.read();
      file.close();
      return text;
    }
  },

  write: function(path, text) {
    var file = new LocalFile(this.makepath(path));
    file.open(WRITE);
    file.write(text);
    file.close();
  },

  "@(ActiveXObject)": {
    copy: function(path1, path2) {
      _activex_exec(this.isDirectory(path1) ? "CopyFolder" : "CopyFile", this.makepath(path1), this.makepath(path2), true);
    },

    exists: function(path) {
      return this.isFile(path) || this.isDirectory(path);
    },

    isFile: function(path) {
      return _activex_exec("FileExists", this.makepath(path));
    },
    
    isDirectory: function(path) {
      return _activex_exec("FolderExists", this.makepath(path));
    },
  
    mkdir: function(path) {
      _activex_exec("CreateFolder", this.makepath(path));
    },
    
    move: function(path1, path2) {
      _activex_exec(this.isDirectory(path1) ? "MoveFolder" : "MoveFile", this.makepath(path1), this.makepath(path2));
    },
    
    remove: function(path) {
      if (this.isFile(path)) {
        _activex_exec("DeleteFile", this.makepath(path));
      } else if (this.isDirectory(path)) {
        _activex_exec("DeleteFolder", this.makepath(path));
      }
    }
  },

  "@(Components)": { // XPCOM
    copy: function(path1, path2) {
      var file1 = _xpcom_createFile(this.makepath(path1));
      var file2 = _xpcom_createFile(this.makepath(path2));
      file1.copyTo(file2.parent, file2.leafName);
    },
    
    exists: function(path) {
      return _xpcom_createFile(this.makepath(path)).exists();
    },
    
    isFile: function(path) {
      var file = _xpcom_createFile(this.makepath(path))
      return file.exists() && file.isFile();
    },
    
    isDirectory: function(path) {
      var file = _xpcom_createFile(this.makepath(path))
      return file.exists() && file.isDirectory();
    },
  
    mkdir: function(path) {
      _xpcom_createFile(this.makepath(path)).create(1);
    },
    
    move: function(path1, path2) {
      var file1 = _xpcom_createFile(this.makepath(path1));
      var file2 = _xpcom_createFile(this.makepath(path2));
      file1.moveTo(file2.parent, file2.leafName);
    },
    
    remove: function(path) {
      _xpcom_createFile(this.makepath(path)).remove(false);
    }
  },

  "@(java && !global.Components)": {
    exists: function(path) {
      return _java_createFile(this.makepath(path)).exists();
    },

    isFile: function(path) {
      return _java_createFile(this.makepath(path)).isFile();
    },

    isDirectory: function(path) {
      return _java_createFile(this.makepath(path)).isDirectory();
    },

    mkdir: function(path) {
      _java_createFile(this.makepath(path)).mkdir();
    },

    move: function(path1, path2) {
      var file1 = _java_createFile(this.makepath(path1));
      var file2 = _java_createFile(this.makepath(path2));
      file1.renameTo(file2);
    },

    remove: function(path) {
      _java_createFile(this.makepath(path))["delete"]();
    }
  }
}, {
  init: function() {
    forEach.csv("copy,move", function(method) {
      extend(this, method, function(path1, path2, overwrite) {
        assert(this.exists(path1), "File does not exist: " + path1);
        if (this.exists(path2)) {
          if (overwrite) {
            this.remove(path2);
          } else {
            throw new Error("File already exists: " + path2);
          }
        }
        this.base(path1, path2);
      });
    }, this.prototype);
  },

  "@(Components)": { // XPCOM
    init: function() {
      this.base();
      XPCOM.privelegedObject(this.prototype);
    }
  },
  
  fromNativePath: I,
  toNativePath: I,

  getPath: K("/"),

  "@(global.java.io.File.separator=='\\\\')": _win_formatter,
  "@(jscript)": _win_formatter,
  "@win(32|64)": _win_formatter,
  
  "@(java)": {
    getPath: function() {
      return this.fromNativePath(new java.io.File("").getAbsolutePath());
    }
  },

  "@(ActiveXObject)": {
    getPath: function() {
      var fso = new ActiveXObject("Scripting.FileSystemObject");
      return this.fromNativePath(fso.GetFolder(".").path);
    }
  },

  "@(location)": {
    getPath: function() {
      return decodeURIComponent(location.pathname.replace(_TRIM_PATH, ""));
    }
  },

  "@(true)": {
    getPath: function() { // memoise
      var path = this.base();
      this.getPath = K(path);
      return path;
    }
  }
});
