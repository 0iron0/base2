
var Namespace = Base.extend({
  constructor: function(_private, _public) {
    this.extend(_public);
    this.init();
    
    if (this.name != "base2") {
      if (!this.parent) this.parent = base2;
      this.parent.addName(this.name, this);
      this.namespace = format("var %1=%2;", this.name, String(this).slice(1, -1));
    }
    
    var LIST = /[^\s,]+/g; // pattern for comma separated list
    
    if (_private) {
      // This string should be evaluated immediately after creating a Namespace object.
      _private.imports = Array2.reduce(this.imports.match(LIST), function(namespace, name) {
        eval("var ns=base2." + name);
        assert(ns, format("Namespace not found: '%1'.", name));
        return namespace += ns.namespace;
      }, base2.namespace);
      
      // This string should be evaluated after you have created all of the objects
      // that are being exported.
      _private.exports = Array2.reduce(this.exports.match(LIST), function(namespace, name) {
        var fullName = this.name + "." + name;
        this.namespace += "var " + name + "=" + fullName + ";";
        return namespace += "if(!" + fullName + ")" + fullName + "=" + name + ";";
      }, "", this);
    }
  },

  exports: "",
  imports: "",  
  init: Undefined,
  name: "",
  namespace: "",
  parent: null,

  addName: function(name, value) {
    if (!this[name]) {
      this[name] = value;
      this.exports += ", " + name;
      this.namespace += format("var %1=%2.%1;", name, this.name);
    }
  },

  addNamespace: function(name) {
    this.addName(name, new Namespace(null, {name: name, parent: this}));
  },
  
  toString: function() {
    return format("[%1]", this.parent ? String(this.parent).slice(1, -1) + "." + this.name : this.name);
  }
});
