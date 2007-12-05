
// A class for reading/writing the local file system. Works for Moz/IE/Opera(java)
// the java version seems a bit buggy when writing...?

var LocalFile = Base.extend({
  constructor: function(path, mode) {
    assignID(this);
    this.path = LocalFile.makepath(path);
    if (mode) this.open(mode);
  },

  mode: 0,
  path: "",

  close: function() {
    delete LocalFile.opened[this.base2ID];
    delete this.$stream;
    this.mode = LocalFile.CLOSED;
  },

  open: function(mode) {
    this.mode = mode || LocalFile.READ;
    LocalFile.opened[this.base2ID] = this;
  },

  exists: NOT_SUPPORTED,
  read: NOT_SUPPORTED,
  remove: NOT_SUPPORTED,
  write: NOT_SUPPORTED,

  "@(ActiveXObject)": {
    constructor: function(path, mode) {
      this.$fso = new ActiveXObject("Scripting.FileSystemObject");
      this.base(path, mode);
    },

    close: function() {
      if (this.$stream) {
        this.$stream.Close();
        this.base();
      }
    },

    exists: function() {
      return this.$fso.FileExists(this.path);
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        switch (this.mode) {
          case LocalFile.READ:
            if (!this.exists()) {
              this.mode = LocalFile.CLOSED;
              break;
            }
            this.$stream = this.$fso.OpenTextFile(this.path, 1);
            break;
          case LocalFile.WRITE:
            this.$stream = this.$fso.OpenTextFile(this.path, 2, -1, 0);
            break;
        }
      }
    },

    read: function() {
      return this.$stream.ReadAll();
    },

    remove: function() {
      return this.$fso.GetFile(this.path).Delete();
    },

    write: function(text) {
      this.$stream.Write(text || "");
    }
  },

  "@(Components)": { // XPCOM
    constructor: function(path, mode) {
      this.$nsILocalFile = LocalFile.$createObject();
      this.base(path, mode);
    },

    $init: function() {
      var file = this.$nsILocalFile;
      try {
        file.initWithPath(this.path);
      } catch (error) {
        file.initWithPath(location.pathname);
        file.setRelativeDescriptor(file, this.path);
      }
      return file;
    },

    close: function() {
      if (this.$stream) {
        if (this.mode == LocalFile.WRITE) this.$stream.flush();
        this.$stream.close();
        this.base();
      }
    },

    exists: function() {
      return this.$init().exists();
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        var file = this.$init();
        switch (this.mode) {
          case LocalFile.READ:
            if (!file.exists()) {
              this.mode = LocalFile.CLOSED;
              break;
            }
            var $stream = XPCOM.createObject("network/file-input-stream;1", "nsIFileInputStream");
            $stream.init(file, 0x01, 00004, null);
            this.$stream = XPCOM.createObject("scriptableinputstream;1", "nsIScriptableInputStream");
            this.$stream.init($stream);
            break;
          case LocalFile.WRITE:
            if (!file.exists()) file.create(0, 0664);
            this.$stream = XPCOM.createObject("network/file-output-stream;1", "nsIFileOutputStream");
            this.$stream.init(file, 0x20 | 0x02, 00004, null);
            break;
        }
      }
    },

    read: function() {
      return this.$stream.read(this.$stream.available());
    },

    remove: function() {
      this.$init().remove(false);
    },

    write: function(text) {
      if (text == null) text = "";
      this.$stream.write(text, text.length);
    }
  },

  "@(java && !global.Components)": {
    close: function() {
      if (this.$stream) {
        this.$stream.close();
        this.base();
      }
    },

    exists: function() {
      return new java.io.File(this.path).exists();
    },

    open: function(mode) {
      if (!this.$stream) {
        this.base(mode);
        switch (this.mode) {
          case LocalFile.READ:
            var file = new java.io.FileReader(this.path);
            this.$stream = new java.io.BufferedReader(file);
            break;
          case LocalFile.WRITE:
            var file = new java.io.FileOutputStream(this.path);
            this.$stream = new java.io.PrintStream(file);
            break;
        }
      }
    },

    read: function() {
      var lines = [];
      var line, i = 0;
      while ((line = this.$stream.readLine()) != null) {
        lines[i++] = line;
      }
      return lines.join("\r\n");
    },

    write: function(text) {
      this.$stream.print(text || "");
    }
  }
}, {
  CLOSED: 0,
  READ: 1,
  WRITE: 2,

  opened: {},

  backup: function(fileName, backupName) {
    var text = this.read(fileName);
    this.write(backupName || (fileName + ".backup"), text);
    return text;
  },

  closeAll: function() {
    var files = this.opened;
    for (var i in files) files[i].close();
  },

  exists: function(fileName) {
    return new this(fileName).exists();
  },

  makepath: function(fileName) {
    var TRIM = /[^\/]+$/;
    var path = location.pathname.replace(TRIM, "");
    path = FileSystem.resolve(path, fileName);
    return decodeURIComponent(path);
  },

  "@win(32|64)": {
    makepath: function(fileName) {
      var SLASH = /\//g;
      var BACKSLASH = /\\/g;
      var TRIM = /[^\/]+$/;
      fileName = String(fileName || "").replace(BACKSLASH, "/");
      var path = location.pathname.replace(BACKSLASH, "/").replace(TRIM, "");
      path = FileSystem.resolve(path, fileName).slice(1);
      return decodeURIComponent(path.replace(SLASH, "\\"));
    }
  },

  read: function(fileName) {
    var file = new this(fileName, this.READ);
    var text = file.mode ? file.read() : "";
    file.close();
    return text;
  },

  remove: function(fileName) {
    var file = new this(fileName);
    file.remove();
  },

  write: function(fileName, text) {
    var file = new this(fileName, this.WRITE);
    file.write(text);
    file.close();
  },

  "@(Components)": {
    init: function() {
      XPCOM.privelegedObject(this.prototype);
      this.$createObject = XPCOM.privelegedMethod(function() {
        return XPCOM.createObject("file/local;1", "nsILocalFile");
      });
    }
  }
});
