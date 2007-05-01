
// A base class to derive file systems from.
// Here we'll define all the path management code.

var FileSystem = Base.extend({
	path: "/",
	
	chdir: function(path) {
		// set the current path
		path = this.makepath(path);
		if (!/\/$/.test(path)) { // trailing slash?
			if (this.isDirectory(path)) {
				// if it's a directory add the slash
				path += "/";
			} else {
				// if it's not then trim to the last slash
				path = path.replace(/[^\/]+$/, "");
			}
		}
		this.path = path;
	},
	
	makepath: function(path1, path2) {
		if (arguments.length == 1) {
			path2 = path1;
			path1 = this.path;
		}
		return FileSystem.resolve(path1, path2);
	}, 
		
	copy: IO.NOT_SUPPORTED,
	exists: IO.NOT_SUPPORTED,
	isDirectory: IO.NOT_SUPPORTED,
	isFile: IO.NOT_SUPPORTED,
	mkdir: IO.NOT_SUPPORTED,
	move: IO.NOT_SUPPORTED,
	read: IO.NOT_SUPPORTED,
	remove: IO.NOT_SUPPORTED,
	write: IO.NOT_SUPPORTED
}, {
	resolve: function(path1, path2) {
		var FILENAME = /[^\/]+$/;
		var RELATIVE = /\/[^\/]+\/\.\./g;
		// stringify
		path1 = String(path1 || "");
		path2 = String(path2 || "");
		// create a full path from two paths
		if (path2.charAt(0) == "/") {
			var path = "";
		} else {
			path = path1.replace(FILENAME, "");
		}
		path += path2;
		// get rid of ../ relative paths
		while (RELATIVE.test(path)) {
			path = path.replace(RELATIVE, "");
		}
		return path;
	}
});
