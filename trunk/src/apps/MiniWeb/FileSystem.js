
// This class wraps the various file retrieval systems.
//  So far they are:
//      JSON (js:)
//      Local file system (file:)

var FileSystem = JSONFileSystem.extend({
	constructor: function() {
		this.base(MiniWeb.data);
	},
	
	remove: function(path) {
		MiniWeb.dirty = true;
		return this.base(path);
	},
	
	write: function(path, data) {
		MiniWeb.dirty = true;
		return this.base(path, data);
	},
	
	protocol: "json:" /*
}, {
	protocols: new Hash,
	
	init2: function() { //-dean
		var protocols = this.protocols;
		Base.forEach (this.prototype, function(method, name) {
			if (typeof method == "function" && !/chdir/.test(name)) {
				this[name] = function() {
					var protocol = protocols.fetch(this.protocol);
					protocol.path = this.path;
					var result = protocol[name].apply(protocol, arguments);
					this.path = protocol.path;
					return result;
				};
			}
		}, this.prototype);
	} */
});
