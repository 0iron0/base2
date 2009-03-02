
base2.global.html5 = new base2.Package(this, {
  name:    "html5",
  version: "0.1",
  imports: "Function2,Enumerable,DOM,jsb",
  exports: "element,meter",

  get: function(element, propertyName) {
    var behavior = this.getBehavior(element);
    if (behavior) {
      return behavior.get(element, propertyName);
    }
    return undefined;
  },

  set: function(element, propertyName, value) {
    var behavior = this.getBehavior(element);
    if (behavior) {
      behavior.set(element, propertyName, value);
    }
  },

  getBehavior: function(element) {
    var behavior = this[element.nodeName.toLowerCase()];
    if (behavior == html5.input || behavior == html5.button) {
      behavior = behavior[Element.getAttribute(element, "type")];
    }
    return behavior;
  },

  "@MSIE": {
    init: function() {
      var newElements =
        "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details,dialog,eventsource," +
        "figure,footer,header,mark,menu,meter,nav,output,progress,section,time,video";
      forEach.csv(newElements, function(tagName) {
        document.createElement(tagName);
      });
    }
  }
});

eval(this.imports);
