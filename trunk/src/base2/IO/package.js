
var IO = new base2.Package(this, {
  name:    "IO",
  version: "0.8",
  exports: "FileSystem, Directory, LocalFileSystem, LocalDirectory, LocalFile, JSONFileSystem, JSONDirectory"
});

eval(this.imports);

function NOT_SUPPORTED() {
  throw new Error("Not supported.");
};
