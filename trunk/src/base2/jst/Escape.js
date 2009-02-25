
var Escape = Module.extend({
  escape: function(parser, string) {
    if (parser.escapeChar) {
      // encode escaped characters
      var ESCAPE = new RegExp(rescape(parser.escapeChar + "."), "g");
      string = string.replace(ESCAPE, function(match) {
        return String.fromCharCode(Escape.BASE + match.charCodeAt(1));
      });
    }
    return string;
  },
  
  unescape: function(parser, string) {
    // decode escaped characters
    if (parser.escapeChar) {
      string = string.replace(Escape.RANGE, function(match) {
        return parser.escapeChar + String.fromCharCode(match.charCodeAt(0) - Escape.BASE);
      });
    }
    return string;
  }
}, {
  BASE: 65280,
  RANGE: /[\uff00-\uffff]/g
});
