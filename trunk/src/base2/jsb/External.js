
var External = Base.extend({
  constructor: function(url, register) {
    url = url.split("#");
    this.src = url[0];
    this.path = url[1].split(".");
    this.register = register;
  },

//id: null,
//src: "",
//script: null,

  attach: true,

  getObject: function() {
    var object = global, i = 0;
    while (object && i < this.path.length) {
      object = object[this.path[i++]];
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
      if (!object.attach) this.attach = false;
    }
    return object;
  }
}, {
  SCRIPT: document.createElement("script"),
  scripts: {}
});
