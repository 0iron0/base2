
var JavaScript = {
  name:      "JavaScript",
  version:   base2.version,
  exports:   "Array2,Date2,String2",
  namespace: "", // fixed later
  
  bind: function(host) {
    forEach (this.exports.match(/\w+/g), function(name2) {
      var name = name2.slice(0, -1);
      extend(host[name], this[name2]);
      this[name2](host[name].prototype); // cast
    }, this);
    return this;
  }
};
