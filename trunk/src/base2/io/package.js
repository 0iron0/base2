
var io = new base2.Package(this, {
  name:    "io",
  version: base2.version,
  imports: "Enumerable,Function2",
  exports: "NOT_SUPPORTED,READ,WRITE,FileSystem,Directory,LocalFileSystem,LocalDirectory,LocalFile"
});

eval(this.imports);

var NOT_SUPPORTED = function() {
  throw new Error("Not supported.");
};

var READ = 1, WRITE = 2;

var _RELATIVE       = /\/[^\/]+\/\.\./,
    _TRIM_PATH      = /[^\/]+$/,
    _SLASH          = /\//g,
    _BACKSLASH      = /\\/g,
    _LEADING_SLASH  = /^\//,
    _TRAILING_SLASH = /\/$/;

var _INVALID_MODE = function() {
  throw new Error("Invalid file open mode.");
};

var _win_formatter = {
  fromNativePath: function(path) {
    return "/" + String(path).replace(_BACKSLASH, "/");
  },

  toNativePath: function(path) {
    return String(path).replace(_LEADING_SLASH, "").replace(_SLASH, "\\");
  }
};

function _makeNativeAbsolutePath(path) {
  return LocalFileSystem.toNativePath(FileSystem.resolve(LocalFileSystem.getPath(), path));
};

var _fso; // FileSystemObject
function _activex_exec(method, path1, path2, flags) {
  if (!_fso) _fso = new ActiveXObject("Scripting.FileSystemObject");
  path1 = _makeNativeAbsolutePath(path1);
  if (arguments.length > 2) {
    path2 = _makeNativeAbsolutePath(path2);
  }
  switch (arguments.length) {
    case 2: return _fso[method](path1);
    case 3: return _fso[method](path1, path2);
    case 4: return _fso[method](path1, path2, flags);
  }
  return undefined; // Prevent strict warnings
};

function _xpcom_createFile(path) {
  var file = XPCOM.createObject("file/local;1", "nsILocalFile");
  file.initWithPath(_makeNativeAbsolutePath(path));
  return file;
};

function _java_createFile(path) {
  return new java.io.File(_makeNativeAbsolutePath(path));
};
