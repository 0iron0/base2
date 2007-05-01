
// A collection of stubs that map out the directory structure.
// -- it's too expensive to create full file objects...

var Directory = Collection.extend({
	sort: function() {
		return this.base(function(file1, file2, name1, name2) {
			if (file1.isDirectory != file2.isDirectory) {
				return file1.isDirectory ? -1 : 1; 
			} else {
				return name1 < name2 ? -1 : 1; 
			}
		});
	}
}, {
	Item: {
		constructor: function(name, isDirectory, size) {
			this.name = String(name);
			this.isDirectory = Boolean(isDirectory);
			this.size = Number(size || 0);
		},
		
		toString: function() {
			return this.name;
		}
	}
});
