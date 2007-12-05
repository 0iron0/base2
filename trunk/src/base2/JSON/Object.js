
JSON.Object = Module.extend({
  toJSONString: function(object) {
    return object == null ? "null" : "{" + reduce(object, function(properties, property, name) {
      if (JSON.Object.isValid(property)) {
        properties.push(JSON.String.toJSONString(name) + ":" + JSON.toString(property));
      }
      return properties;
    }, []).join(",") + "}";
  }
}, {
  VALID_TYPE: /^(object|boolean|number|string)$/,
  
  isValid: function(object) {
    return this.VALID_TYPE.test(typeof object);
  }
});
