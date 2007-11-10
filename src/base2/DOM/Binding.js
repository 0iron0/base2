
var Binding = Interface.extend(null, {
  bind: function(object) {
    forEach (this.prototype, function(method, name) {
      if (typeof object[name] == "undefined") {
        object[name] = method;
      } else {
        try {
          extend(object, name, method);
        } catch (error) {
          // some methods can't be overridden (e.g. methods of the <embed> element)
          // we'll just ignore the errors..
        }
      }
    });
    return object;
  }
});
