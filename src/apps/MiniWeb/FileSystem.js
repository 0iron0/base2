
// This class wraps the various file retrieval systems.
// So far they are:
//   JSON (json:)
//   Local file system (file:)

var FileSystem = JSONFileSystem.extend({
  constructor: function() {
    this.base(MiniWeb.$$);
  },
  
  remove: function(path) {
    MiniWeb.dirty = true;
    return this.base(path);
  },
  
  write: function(path, data) {
    MiniWeb.dirty = true;
    return this.base(path, data);
  },
  
  protocol: "json:"
});
