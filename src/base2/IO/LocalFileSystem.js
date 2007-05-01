
var LocalFileSystem = FileSystem.extend({
	read: function(path) {
		return LocalFile.read(path);
	},

	write: function(path, text) {
		return LocalFile.write(path, text);
	},

	"@(ActiveXObject)": { // ActiveX
		constructor: function() {
			this.$fso = new ActiveXObject("Scripting.FileSystemObject");
		},
		
		copy: function(path1, path2) {
			var method = this.isDirectory(path1) ? "CopyFolder" : "CopyFile"
			this.$fso[method](path1, path2, true);
		},
		
		isFile: function(path) {
			return this.$fso.FileExists(path);
		},
		
		isDirectory: function(path) {
			return this.$fso.FolderExists(path);
		},
	
		mkdir: function(path) {
			return this.$fso.CreateFolder(path);
		},
		
		move: function(path1, path2) {
			var method = this.isDirectory(path1) ? "MoveFolder" : "MoveFile"
			this.$fso[method](path1, path2);
		},
		
		read: function(path) {
			if (this.isDirectory(path)) {
				return new LocalDirectory(this.$fso.GetFolder(path));
			}
			return this.base(path);
		},
		
		remove: function(path) {
			if (this.isFile(path)) {
				this.$fso.DeleteFile(path);
			} else if (this.isDirectory(path)) {
				this.$fso.DeleteFolder(path);
			}
		}
	},

	"@(Components)": { // XPCOM
		constructor: function() {
			this.$nsILocalFile = LocalFile.$createObject();
		},
		
		copy: function(path1, path2) {
			return this.$nsILocalFile.copyTo(path2);
		},
		
		exists: function(path) {
			return this.$nsILocalFile.exists();
		},
		
		isFile: function(path) {
			return this.exists() && this.$nsILocalFile.isFile();
		},
		
		isDirectory: function(path) {
			return this.exists() && this.$nsILocalFile.isDirectory();
		},
	
		mkdir: function(path) {
			return this.$nsILocalFile.create(1);
		},
		
		move: function(path1, path2) {
			return this.$nsILocalFile.moveTo(path2);
		},
		
		read: function(path) {
			if (this.isDirectory(path)) {
				return new LocalDirectory(this.$nsILocalFile.directoryEntries);
			}
			return this.base(path);
		},
		
		remove: function(path) {
			this.$nsILocalFile.remove(false);
		}
	},

	"@(java && navigator.javaEnabled() && !window.Components)": { // java
		exists: function(path) {
			return new java.io.File(path).exists();
		}
	}
}, {
/*	init: function() {
		Base.forEach (this.prototype, function(method, name) {
			if (method instanceof Function && !/chdir|makepath/.test(name)) {
				this.extend(name, function(path) {
					return method.apply(this, arguments);
				});
			}
		}, this.prototype);
	}, */
	
	"@(Components)": { // XPCOM	
		init: function() {
			XPCOM.privelegedObject(this.prototype);
		//-	this.base();
		}
	}
});
