
var LocalDirectory = Directory.extend({
	"@(ActiveXObject)": { // ActiveX
		constructor: function(directory) {
			this.base();
			var files = directory.files;
			var length = files.Count();			
			for (var i = 0; i < length; i++) {
				this.store(files.item(i));
			}
		}
	},

	"@(Components)": { // XPCOM
		constructor: XPCOM.privelegedMethod(function(directory) {
			this.base();
			var enumerator = directory.QueryInterface(Components.interfaces.nsIDirectoryEnumerator);
			while (enumerator.hasMoreElements()) {
				this.store(enumerator.nextFile);
			}
		})
	}
}, {
	"@(ActiveXObject)": {	
		create: function(name, file) {
			if (!instanceOf(file, this.Item)) {
				file = new this.Item(file.Name, file.Type | 16, file.Size);
			}
			return file;
		}
	},

	"@(Components)": {
		create: function(name, file) {
			if (!instanceOf(file, this.Item)) {
				file = new this.Item(file.leafName, file.isDirectory(), file.fileSize);
			}
			return file;
		}
	}
});
