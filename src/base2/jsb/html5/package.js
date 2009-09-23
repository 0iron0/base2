
base2.global.html5 = new base2.Package(this, {
  name:    "html5",
  version: "0.4",
  imports: "Function2,Enumerable,dom,jsb",

  rules: new jsb.RuleList,
  
  NOT_SUPPORTED: function() {
    throw "Not supported in html5.js.";
  },

  get: function(element, propertyName) {
    return this.getBehavior(element).get(element, propertyName);
  },

  set: function(element, propertyName, value) {
    this.getBehavior(element).set(element, propertyName, value);
  },

  getBehavior: function(element) {
    return this[element.nodeName.toLowerCase()] || behavior;
  }
});

eval(this.imports);
