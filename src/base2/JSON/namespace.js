
// This code is loosely based on Douglas Crockford's original:
//  http://www.json.org/json.js

// This is not a particularly great implementation. I hacked it together to
//  support another project. It seems to work well enough though.

var JSON = new base2.Namespace(this, {
  name:    "JSON",
  version: "0.9",

  // IE5.0 doesn't like non-greedy RegExps
  //VALID: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/,
  VALID: /^("(\\.|[^"\\\n\r])*"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])*$/,
  
  copy: function(object) {
    // use JSON to make a deep copy of an object
    return this.parse(this.toString(object));
  },
  
  parse: function(string) {
    return this.String.parseJSON(string);
  }
});

eval(this.imports);

extend(JSON, "toString", function(object) {
  if (arguments.length == 0) return this.base();
  // find the appropriate module
  var module = this.Object; // default
  try {
    forEach (this, function(property, name) {
      if (JSON.Object.ancestorOf(property) && instanceOf(object, global[name])) {
        module = property;
        throw StopIteration;
      }
    });
  } catch (error) {
    if (error != StopIteration) throw error;
  }
  return module.toJSONString(object);
});
