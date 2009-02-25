
var External = Base.extend({
  constructor: function(url, callback) {
    url = url.split("#");
    this.src = url[0];
    this.id = url[1].split(".");
    this.callback = callback;
  },

//id: null,
//loaded: false,
//src: "",
//script: null,
  
  getObject: function() {
    if (!this.loaded) this.load();
    var object = window, i = 0;
    while (object && i < this.id.length) {
      object = object[this.id[i++]];
    }
    if (object) {
      this.callback(object);
      this.unload();
    }
    return object;
  },

  load: function() {
    // load the external script
    External.SCRIPT.src = this.src;
    if (!External.scripts[External.SCRIPT.src]) {
      External.scripts[External.SCRIPT.src] = true;
      this.script = document.createElement("script");
      this.script.type = "text/javascript";
      this.script.src = this.src;
      behavior.querySelector("head").appendChild(this.script);
    }
    this.loaded = true;
  },

  unload: function() {
    // remove the external script (keeps the DOM clean)
    if (this.script) {
      this.script.parentNode.removeChild(this.script);
      this.script = null;
    }
  }
}, {
  SCRIPT: document.createElement("script"),
  scripts: {}
});
