
JSON.String = JSON.Object.extend({
  parseJSON: function(string) {
    try {
      if (JSON.VALID.test(string)) {
        return new Function("return " + string)();
      }
    } catch (x) {
      throw new SyntaxError("parseJSON");
    }
    return "";
  },

  toJSONString: function(string) {
    return '"' + this.ESCAPE.exec(string) + '"';
  }
}, {
  ESCAPE: new RegGrp({
    '"' :   '\\"',
    '\\\\': '\\\\'
  })
});

JSON.String.ESCAPE.put(
  /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/,
  function(chr) {
    var charCode = chr.charCodeAt(0);
    return '\\u00' + (~~(charCode / 16)).toString(16) + (charCode % 16).toString(16);
  }
);