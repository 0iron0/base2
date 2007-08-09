  
var Parser = RegGrp.extend({
  constructor: function(items) {
    this.base(items);
    this.cache = {};
    this.sorter = new RegGrp;
    this.sorter.add(/:not\([^)]*\)/, RegGrp.IGNORE);
    this.sorter.add(/([ >](\*|[\w-]+))([^: >+~]*)(:\w+-child(\([^)]+\))?)([^: >+~]*)/, "$1$3$6$4");
  },
  
  cache: null,
  ignoreCase: true,
  
  escape: function(selector) {
    // remove strings
    var QUOTE = /'/g;
    var strings = this._strings = [];
    return this.optimise(this.format(String(selector).replace(Parser.ESCAPE, function(string) {
      strings.push(string.slice(1, -1).replace(QUOTE, "\\'"));
      return "\x01" + strings.length;
    })));
  },
  
  format: function(selector) {
    return selector
      .replace(Parser.WHITESPACE, "$1")
      .replace(Parser.IMPLIED_SPACE, "$1 $2")
      .replace(Parser.IMPLIED_ASTERISK, "$1*$2");
  },
  
  optimise: function(selector) {
    // optimise wild card descendant selectors
    return this.sorter.exec(selector.replace(Parser.WILD_CARD, ">* "));
  },
  
  parse: function(selector) {
    return this.cache[selector] ||
      (this.cache[selector] = this.unescape(this.exec(this.escape(selector))));
  },
  
  unescape: function(selector) {
    // put string values back
    var strings = this._strings;
    return selector.replace(/\x01(\d+)/g, function(match, index) {
      return strings[index - 1];
    });
  }
}, {
  ESCAPE:           /(["'])[^\1]*\1/g,
  IMPLIED_ASTERISK: /([\s>+~,]|[^(]\+|^)([#.:@])/g,
  IMPLIED_SPACE:    /(^|,)([^\s>+~])/g,
  WHITESPACE:       /\s*([\s>+~(),]|^|$)\s*/g,
  WILD_CARD:        /\s\*\s/g,
  
  _nthChild: function(match, args, position, last, not, and, mod, equals) {
    // ugly but it works for both CSS and XPath
    last = /last/i.test(match) ? last + "+1-" : "";
    if (!isNaN(args)) args = "0n+" + args;
    else if (args == "even") args = "2n";
    else if (args == "odd") args = "2n+1";
    args = args.split(/n\+?/);
    var a = args[0] ? (args[0] == "-") ? -1 : parseInt(args[0]) : 1;
    var b = parseInt(args[1]) || 0;
    var not = a < 0;
    if (not) {
      a = -a;
      if (a == 1) b++;
    }
    var query = format(a == 0 ? "%3%7" + (last + b) : "(%4%3-%2)%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
    if (not) query = not + "(" + query + ")";
    return query;
  }
});
