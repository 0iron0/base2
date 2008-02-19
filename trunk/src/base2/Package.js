
var Package = Base.extend({
  constructor: function(_private, _public) {
    this.extend(_public);
    if (this.init) this.init();
    
    if (this.name != "base2") {
      if (!this.parent) this.parent = base2;
      this.parent.addName(this.name, this);
      this.namespace = format("var %1=%2;", this.name, String2.slice(this, 1, -1));
    }
    
    if (_private) {
      // This string should be evaluated immediately after creating a Package object.
      _private.imports = Array2.reduce(csv(this.imports), function(namespace, name) {
        eval(format("var ns=(base2.%1||JavaScript.%1)", name));
        ;;; assert(ns, format("Package not found: '%1'.", name), ReferenceError);
        return namespace += ns.namespace;
      }, _namespace + base2.namespace + JavaScript.namespace) + lang.namespace;
      
      // This string should be evaluated after you have created all of the objects
      // that are being exported.
      _private.exports = Array2.reduce(csv(this.exports), function(namespace, name) {
        var fullName = this.name + "." + name;
        this.namespace += "var " + name + "=" + fullName + ";";
        return namespace += "if(!" + fullName + ")" + fullName + "=" + name + ";";
      }, "", this);
    }
  },

  exports: "",
  imports: "",
  name: "",
  namespace: "",
  parent: null,

  addName: function(name, value) {
    if (!this[name]) {
      this[name] = value;
      this.exports += "," + name;
      this.namespace += format("var %1=%2.%1;", name, this.name);
    }
  },

  addPackage: function(name) {
    this.addName(name, new Package(null, {name: name, parent: this}));
  },
  
  toString: function() {
    return format("[%1]", this.parent ? String2.slice(this.parent, 1, -1) + "." + this.name : this.name);
  }
});
