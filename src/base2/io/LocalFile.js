
// A class for reading/writing the local file system. Works for Moz/IE/Opera(java)
// the java version seems a bit buggy when writing...?

var LocalFile = Base.extend({
  constructor: function(path) {
    this.toString = K(FileSystem.resolve(LocalFileSystem.getPath(), path));
  },
  
  close: _INVALID_MODE,
  open: NOT_SUPPORTED,
  read: _INVALID_MODE,
  write: _INVALID_MODE,

  "@(ActiveXObject)": {
    open: function(mode) {
      var path = LocalFileSystem.toNativePath(this);
      var fso = new ActiveXObject("Scripting.FileSystemObject");
      
      switch (mode) {
        case READ:
          assert(fso.FileExists(path), "File does not exist: " + this);
          var stream = fso.OpenTextFile(path, 1);
          this.read = function() {
            return stream.ReadAll();
          };
          break;
          
        case WRITE:
          stream = fso.OpenTextFile(path, 2, -1, 0);
          this.write = function(text) {
            stream.Write(text || "");
          };
          break;
      }
      
      this.close = function() {
        stream.Close();
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  },

  "@(Components)": { // XPCOM
    open: function(mode) {
      var file = _xpcom_createFile(this);
      
      switch (mode) {
        case READ:
          assert(file.exists(), "File does not exist: " + this);
          var input = XPCOM.createObject("network/file-input-stream;1", "nsIFileInputStream");
          input.init(file, 0x01, 00004, null);
          var stream = XPCOM.createObject("scriptableinputstream;1", "nsIScriptableInputStream");
          stream.init(input);
          this.read = function() {
            return stream.read(stream.available());
          };
          break;
          
        case WRITE:
          if (!file.exists()) file.create(0, 0664);
          stream = XPCOM.createObject("network/file-output-stream;1", "nsIFileOutputStream");
          stream.init(file, 0x20 | 0x02, 00004, null);
          this.write = function(text) {
            if (text == null) text = "";
            stream.write(text, text.length);
          };
          break;
      }
      
      this.close = function() {
        if (mode == WRITE) stream.flush();
        stream.close();
        
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  },

  "@(java && !global.Components)": {
    open: function(mode) {
      var path = LocalFileSystem.toNativePath(this);
      var io = java.io;
      
      switch (mode) {
        case READ:
          var file = _java_createFile(this);
          assert(file.exists(), "File does not exist: " + this);
          var stream = new io.BufferedReader(new io.FileReader(path));
          this.read = function() {
            var lines = [], line, i = 0;
            while ((line = stream.readLine()) != null) {
              lines[i++] = line;
            }
            return lines.join("\r\n");
          };
          break;
          
        case WRITE:
          assert(!global.navigator, "Cannot write to local files with this browser.");
          stream = new io.PrintStream(new io.FileOutputStream(path));
          this.write = function(text) {
            stream.print(text || "");
          };
          break;
      }
      
      this.close = function() {
        stream.close();
        
        delete this.read;
        delete this.write;
        delete this.close;
      };
    }
  }
});
