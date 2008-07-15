
JSON.String = JSON.Object.extend({
  parseJSON: function(string) {
    try {
      if (JSON.VALID.test(string)) {
        return new Function("return " + string)();
      }
    } catch (error) {
      throw new SyntaxError("parseJSON");
    }
    return "";
  },

  toJSONString: function(string) {
    return '"' + this.ESCAPE.exec(string) + '"';
  }
}, {
  ESCAPE: new RegGrp({
    '\b':   '\\b',
    '\\t':  '\\t',
    '\\n':  '\\n',
    '\\f':  '\\f',
    '\\r':  '\\r',
    '"' :   '\\"',
    '\\\\': '\\\\',
    '[\\x00-\\x1f]': function(chr) {
      var charCode = chr.charCodeAt(0);
      return '\\u00' + Math.floor(charCode / 16).toString(16) + (charCode % 16).toString(16);
    }
  })
});
