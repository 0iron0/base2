
var CSSParser = RegGrp.extend({
  constructor: function(items) {
    this.base(items);
    this.cache = {};
    this.sorter = new RegGrp;
    this.sorter.add(/:not\([^)]*\)/, RegGrp.IGNORE);
    // $1: tag name
    // $3: selector part
    // $4: *-child pseudo class
    // $6: selector part
    this.sorter.add(/([ >](\*|[\w-]+))([^: >+~]*)(:\w+-child(\([^)]+\))?)([^: >+~]*)/, "$1$3$6$4");
  },
  
  cache: null,
  ignoreCase: true,

  escape: function(selector) {
    // remove strings
    var strings = this._strings = [];
    return String(selector).replace(_CSS_ESCAPE, function(string) {
      if (string.indexOf("\\") != 0) {
        string = string.slice(1, -1).replace(_QUOTE, "\\'");
      }
      return "\x01" + strings.push(string) + "\x01";
    });
  },

  format: function(selector) {
    return this.normalise(this.escape(selector + ""));
  },
  
  normalise: function(selector) {
    return selector
      .replace(_CSS_TRIM, "$1")
      .replace(_CSS_LTRIM, "$1")
      .replace(_CSS_RTRIM, "$1")
      .replace(_CSS_IMPLIED_SPACE, "$1 $2")
      .replace(_CSS_IMPLIED_ASTERISK, "$1*$2");
    //.replace(/\\/g, "");
  },
  
  parse: function(selector, simple) {
    return this.cache[selector] ||
      (this.cache[selector] = this.revert(this.exec(this.format(selector, simple))));
  },

  put: function(pattern, value) {
    return this.base(pattern.replace(/ID/g, "\\w\u00a1-\uffff\\-\\x01"), value);
  },

  revert: function(selector) {
    return this.unescape(selector);
  },

  unescape: function(selector) {
    // put string values back
    var strings = this._strings;
    return selector.replace(_CSS_UNESCAPE, function(match, index) {
      return strings[index - 1];
    });
  }
});
