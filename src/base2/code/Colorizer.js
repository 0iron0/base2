
eval(base2.namespace);
eval(Enumerable.namespace);
eval(lang.namespace);

var DEFAULT = "@0";
var IGNORE  = RegGrp.IGNORE;

var Colorizer = RegGrp.extend({
  constructor: function(patterns, replacements, properties) {
    this.extend(properties);
    this.patterns = patterns || {};
    var values = {}, i;
    forEach (patterns, function(pattern, className) {
      values[className] = replacements[className] || DEFAULT;
    });
    forEach (replacements, function(replacement, className) {
      values[className] = replacements[className];
    });
    this.base(values);
  },
  
  patterns: null,
  tabStop: 4,
  urls: true,

  copy: function() {
    var colorizer = this.base();
    colorizer.patterns = copy(this.patterns);
    return colorizer;
  },
  
  exec: function(text, secondary) {
    text = this.base(this.escape(text));
    if (!secondary) { // Not a secondary parse of the text (e.g. CSS within an HTML sample)
      text = this._parseWhiteSpace(text);
      if (this.urls) text = Colorizer.urls.exec(text);
    }
    return this.unescape(text);
  },

  escape: function(text) {
    return String(text).replace(/</g, "\x01").replace(/&/g, "\x02");
  },

  put: function(pattern, replacement) {
    // This is a bit complicated and is therefore probably wrong.
    if (!instanceOf(pattern, RegGrp.Item)) {
      if (typeof replacement == "string") {
        replacement = replacement.replace(/@(\d)/, function(match, index) {
          return format(Colorizer.FORMAT, pattern, index);
        });
      }
      pattern = this.patterns[pattern] || Colorizer.patterns[pattern] || pattern;
      if (instanceOf(pattern, RegExp)) pattern = pattern.source;
      pattern = this.escape(pattern);
    }
    return this.base(pattern, replacement);
  },

  unescape: function(text) {
    return text.replace(/\x01/g, "&lt;").replace(/\x02/g, "&amp;");
  },

  _parseWhiteSpace: function(text) {
    // Convert tabs to spaces and then convert spaces to "&nbsp;".
    var tabStop = this.tabStop;
    if (tabStop > 0) {
      var tab = Array(tabStop + 1).join(" ");
      return text.replace(Colorizer.TABS, function(match) {
        match = match.replace(Colorizer.TAB, tab);
        if (tabStop > 1) {
          var padding = (match.length - 1) % tabStop;
          if (padding) match = match.slice(0, -padding);
        }
        return match.replace(/ /g, "&nbsp;");
      });
    }
    return text;
  },

  "@MSIE": {
    _parseWhiteSpace: function(text) {
      return this.base(text).replace(/\r?\n/g, "<br>");
    }
  }
}, {
  version: "0.8",
  
  FORMAT: '<span class="%1">$%2</span>',
  DEFAULT: DEFAULT,
  IGNORE:  IGNORE,  
  TAB:     /\t/g,
  TABS:    /\n([\t \xa0]+)/g,
  
  init: function() {
    // Patterns that are defined as Arrays represent
    // groups of other patterns. Build those groups.
    forEach (this.patterns, function(pattern, name, patterns) {
      if (instanceOf(pattern, Array)) {
        patterns[name] = reduce(pattern, function(group, name) {
          group.add(patterns[name]);
          return group;
        }, new RegGrp);
      }
    });
    this.urls = this.patterns.urls.copy();
    this.urls.putAt(0, '<a href="mailto:$0">$0</a>');
    this.urls.putAt(1, '<a href="$0">$0</a>');
  },

  addScheme: function(name, patterns, replacements, properties) {
    this[name] = new this(patterns, replacements, properties);
  },
  
  // Pre-defined regular expressions.
  patterns: {
    block_comment: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//,
    email:         /([\w.+-]+@[\w.-]+\.\w+)/,
    line_comment:  /\/\/[^\r\n]*/,
    number:        /\b\-?(0|[1-9]\d*)(\.\d+)?([eE][-+]?\d+)?\b/,
    string1:       /'(\\.|[^'\\])*'/,
    string2:       /"(\\.|[^"\\])*"/,
    url:           /(http:\/\/+[\w\/\-%&#=.,?+$]+)/,
    // groups
    comment:       ["block_comment", "line_comment"],
    string:        ["string1", "string2"],
    urls:          ["email", "url"]
  },
  
  urls: null
});

base2.addPackage("code");
base2.code.addName("Colorizer", Colorizer);
