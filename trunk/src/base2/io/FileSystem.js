
// A base class to derive file systems from.
// Here we'll define all the path management code.

var FileSystem = Base.extend({
  constructor: function(path) {
    if (path) this.chdir(path);
  },

  path: "/",

  chdir: function(path) {
    // Set the current path.
    assert(this.isDirectory(path), path + " is not a directory.");
    path = this.makepath(path);
    if (!_TRAILING_SLASH.test(path)) path += "/";
    this.path = path;
  },

  makepath: function(path1, path2) {
    if (arguments.length == 1) {
      path2 = path1;
      path1 = this.path;
    }
    return FileSystem.resolve(path1, path2);
  },
    
  copy: NOT_SUPPORTED,
  exists: NOT_SUPPORTED,
  isDirectory: NOT_SUPPORTED,
  isFile: NOT_SUPPORTED,
  mkdir: NOT_SUPPORTED,
  move: NOT_SUPPORTED,
  read: NOT_SUPPORTED,
  remove: NOT_SUPPORTED,
  write: NOT_SUPPORTED
}, {
  resolve: function(path1, path2) {
    // Stringify.
    path1 = String(path1 || "");
    path2 = String(path2 || "");
    // Create a full path from two paths.
    if (path2.indexOf("/") == 0) {
      var path = "";
    } else {
      path = path1.replace(_TRIM_PATH, "");
    }
    path += path2;
    // Resolve relative paths.
    while (_RELATIVE.test(path)) {
      path = path.replace(_RELATIVE, "");
    }
    return path;
  }
});
