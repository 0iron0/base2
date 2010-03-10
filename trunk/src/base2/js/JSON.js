
// This code is loosely based on Douglas Crockford's original:
//  http://www.json.org/json.js

var JSON_STRING_VALID  = /^("(\\.|[^"\\\n\r])*"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])*$/;

var JSON_STRING_ESCAPE = new RegGrp({
  '\b':   '\\b',
  '\\t':  '\\t',
  '\\n':  '\\n',
  '\\f':  '\\f',
  '\\r':  '\\r',
  '"':    '\\"',
  '\\\\': '\\\\',
  '[\\x00-\\x1f\\x7f-\\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]':
    function(chr) {
      var charCode = chr.charCodeAt(0);
      return '\\u00' + (~~(charCode / 16)).toString(16) + (charCode % 16).toString(16);
    }
});

base2.JSON = {
  parse: function(string) {
    try {
      if (JSON_STRING_VALID.test(string)) {
        return new Function("window,self,parent,top,document,frames", "return " + string).call({}); // global eval().
      }
    } catch(ex) {}
    
    throw new SyntaxError("JSON.parse");
  },

  stringify: function(object) {
    switch (typeof object) {
      case "boolean":
        return String(object);
        
      case "number":
        return isFinite(object) ? String(object) : "null";
        
      case "string":
        return '"' + JSON_STRING_ESCAPE.parse(object) + '"';
        
      case "object":
        if (object == null) return "null";
        
        switch (_toString.call(object)) {
          case _Date_toString:
            return '"' + Date2.toISOString(object) + '"';

          case _Array_toString:
            var strings = [],
                i = object.length;
            while (i--) {
              var value = this.stringify(object[i]);
              strings[i] = value === undefined ? "null" : value;
            }
            return "[" + strings.join(",") + "]";
            
          case _Object_toString:
            strings = [];
            i = 0;
            for (var name in object) if (!_OBJECT_HIDDEN[name]) {
              value = this.stringify(object[name]);
              if (value !== undefined) {
                strings[i++] = this.stringify(name) + ":" + value;
              }
            }
            return "{" + strings.join(",") + "}";
        }
    }
    return undefined;
  },
  
  toString: K("[object base2.JSON]")
};
