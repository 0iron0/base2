
_register("output", {
  "implements": [noValidation],

  get: function(element, propertyName) {
    if (propertyName == "type") return "output";
    return element[propertyName];
  }
});
