
var IO = new base2.Namespace(this, {
	name:    "IO",
	version: "0.3",
	exports: "FileSystem,Directory,LocalFileSystem,LocalDirectory,LocalFile,JSONFileSystem,JSONDirectory",
	
	NOT_SUPPORTED: function() {
		throw new Error("Not supported.");
	}
});

eval(this.imports);
