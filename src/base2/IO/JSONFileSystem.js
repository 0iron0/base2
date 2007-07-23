
var FETCH = "#" + Number(new Date);

var JSONFileSystem = FileSystem.extend({
	constructor: function(object) {
		this[FETCH] = function(path) {
			// fetch data from the JSON object, regardless of type
			path = this.makepath(path);
			return reduce(path.split("/"), function(file, name) {
				if (file && name) file = file[name];
				return file;
			}, object);
		};
	},
	
	exists: function(path) {
		return this[FETCH](path) !== undefined;
	},
	
	isFile: function(path) {
		return typeof this[FETCH](path) == "string";
	},
	
	isDirectory: function(path) {
		return typeof this[FETCH](path) == "object";
	},

	copy: function(path1, path2) {
		var data = this[FETCH](path1);
		this.write(path2, JSON.copy(data));
	},
	
	mkdir: function(path) {
		// create a directory
		this.write(path, {});
	},
	
	move: function(path1, path2) {
		var data = this[FETCH](path1);
		this.write(path2, data);
		this.remove(path1);
	},

	read: function(path) {		
		// read text from the JSON object
		var file = this[FETCH](path);
		return typeof file == "object" ?
			new JSONDirectory(file) : file || ""; // make read safe
	},
	
	remove: function(path) {
		// remove data from the JSON object
		path = path.replace(/\/$/, "").split("/");
		var filename = path.splice(path.length - 1, 1);
		var directory = this[FETCH](path.join("/"));
		if (directory) delete directory[filename];
	},

	write: function(path, data) {
		// write data to the JSON object
		path = path.split("/");
		var filename = path.splice(path.length - 1, 1);
		var directory = this[FETCH](path.join("/"));
		assert(directory, "Directory not found."); 
		return directory[filename] = data || "";
	}
});
