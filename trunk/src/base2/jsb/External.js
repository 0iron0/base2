
var External = Base.extend({
  constructor: function(url, register) {
    url = url.split("#");
    this.src = url[0];
    this.id = url[1].split(".");
    this.register = register;
  },

//id: null,
//src: "",
//script: null,

  getObject: function() {
    var object = global, i = 0;
    while (object && i < this.id.length) {
      object = object[this.id[i++]];
    }
    return object;
  },

  load: function() {
    var object = this.getObject();
    if (!object && !this.script) {
      // load the external script
      External.SCRIPT.src = this.src;
      if (!External.scripts[External.SCRIPT.src]) { // only load a script once
        External.scripts[External.SCRIPT.src] = true;
        this.script = document.createElement("script");
        this.script.type = "text/javascript";
        this.script.src = this.src;
        behavior.querySelector("head").appendChild(this.script);
      }
      object = this.getObject();
    }
    if (object) {
      this.register(object);
      this.unload();
    }
    return object;
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
