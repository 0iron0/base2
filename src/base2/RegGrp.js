
// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var _RG_BACK_REF        = /\\(\d+)/g;
var _RG_ESCAPE_CHARS    = /\\./g;
var _RG_ESCAPE_BRACKETS = /\(\?[:=!]|\[[^\]]+\]/g;
var _RG_BRACKETS        = /\(/g;

var RegGrp = Collection.extend({
  constructor: function(values, flags) {
    this.base(values);
    if (typeof flags == "string") {
      this.global = /g/.test(flags);
      this.ignoreCase = /i/.test(flags);
    }
  },

  global: true, // global is the default setting
  ignoreCase: false,

  exec: function(string, replacement) { // optimised (refers to _HASH/_KEYS)
    string = String(string); // type-safe
    if (arguments.length == 1) {
      var self = this;
      var keys = this[_KEYS];
      replacement = function(match) {
        if (!match) return "";
        var item, offset = 1, i = 0;
        // Loop through the RegGrp items.
        while (item = self[_HASH + keys[i++]]) {
          var next = offset + item.length + 1;
          if (arguments[offset]) { // do we have a result?
            var replacement = item.replacement;
            switch (typeof replacement) {
              case "function":
                var args = slice(arguments, offset, next);
                var index = arguments[arguments.length - 2];
                return replacement.apply(self, args.concat(index, string));
              case "number":
                return arguments[offset + replacement];
              default:
                return replacement;
            }
          }
          offset = next;
        }
      };
    }
    return string.replace(this.valueOf(), replacement);
  },

  test: function(string) {
    return this.exec(string) != string;
  },
  
  toString: function() {
    var length = 0;
    return "(" + this.map(function(item) {
      // Fix back references.
      var ref = String(item).replace(_RG_BACK_REF, function(match, index) {
        return "\\" + (1 + Number(index) + length);
      });
      length += item.length + 1;
      return ref;
    }).join(")|(") + ")";
  },
  
  valueOf: function(type) {
    if (type == "object") return this;
    var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
    return new RegExp(this, flags);
  }
}, {
  IGNORE: "$0",
  
  init: function() {
    forEach ("add,exists,fetch,remove,store".split(","), function(name) {
      extend(this, name, function(expression) {
        if (instanceOf(expression, RegExp)) {
          expression = expression.source;
        }
        return base(this, arguments);
      });
    }, this.prototype);
  },
  
  Item: {
    constructor: function(expression, replacement) {
      expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
      
      if (typeof replacement == "number") replacement = String(replacement);
      else if (replacement == null) replacement = "";    
      
      // does the pattern use sub-expressions?
      if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
        // a simple lookup? (e.g. "$2")
        if (/^\$\d+$/.test(replacement)) {
          // store the index (used for fast retrieval of matched strings)
          replacement = parseInt(replacement.slice(1));
        } else { // a complicated lookup (e.g. "Hello $2 $1")
          // build a function to do the lookup
          var Q = /'/.test(replacement.replace(/\\./g, "")) ? '"' : "'";
          replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
            "+(arguments[$1]||" + Q+Q + ")+" + Q);
          replacement = new Function("return " + Q + replacement.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q);
        }
      }
      
      this.length = RegGrp.count(expression);
      this.replacement = replacement;
      this.toString = returns(expression);
    },
    
    length: 0,
    replacement: ""
  },
  
  count: function(expression) {
    // Count the number of sub-expressions in a RegExp/RegGrp.Item.
    expression = String(expression).replace(_RG_ESCAPE_CHARS, "").replace(_RG_ESCAPE_BRACKETS, "");
    return match(expression, _RG_BRACKETS).length;
  }
});
