
//eval(base2.namespace);

var DEFAULT = "@0";
var IGNORE  = RegGrp.IGNORE;

var Colorizer = RegGrp.extend({
	constructor: function(values, patterns, properties) {
		this.patterns = patterns || {};
		this.extend(properties);
		this.base(values);
	},
	
	patterns: null,
	tabStop: 4,
	urls: true,

	copy: function() {
		var copy = this.base();
		copy.patterns = copy(this.patterns);
		return copy;
	},
	
	exec: function(text) {
		text = this.base(this.escape(text));
		if (!arguments[1]) {
			text = this._parseWhiteSpace(text);
			if (this.urls) text = Colorizer.urls.exec(text);
		}
		return this.unescape(text);
	},

	escape: function(text) {
		return String(text).replace(/</g, "\x01").replace(/&/g, "\x02");
	},

	store: function(pattern, replacement) {
		if (!instanceOf(pattern, RegGrp.Item)) {
			if (typeof replacement == "string") {
				replacement = replacement.replace(/@(\d)/, function(match, index) {
					return format(Colorizer.$FORMAT, pattern, index);
				});
			}
			pattern = this.patterns[pattern] || Colorizer.patterns[pattern] || pattern;
			if (instanceOf(pattern, RegExp)) pattern = pattern.source;
			pattern = this.escape(pattern);
		}
		this.base(pattern, replacement);
	},

	unescape: function(text) {
		return text.replace(/\x01/g, "&lt;").replace(/\x02/g, "&amp;");
	},

	_parseWhiteSpace: function(text) {
		// fix tabs and spaces
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
	},

	"@MSIE": {
		_parseWhiteSpace: function(text) {
			return this.base(text).replace(/\r?\n/g, "<br>");
		}
	}
}, {
	$FORMAT: '<span class="%1">$%2</span>',
	DEFAULT: DEFAULT,
	IGNORE:  IGNORE,	
	TAB:     /\t/g,
	TABS:    /\n([\t \xa0]+)/g,
	
	init: function() {
		// patterns that are defined as Arrays represent
		//  groups of other patterns. Build those groups.
		forEach (this.patterns, function(pattern, name, patterns) {
			if (instanceOf(pattern, Array)) {
				patterns[name] = reduce(pattern, function(group, name) {
					group.add(patterns[name]);
					return group;
				}, new RegGrp);
			}
		});
		this.urls = this.patterns.urls.copy();
		this.urls.storeAt(0, '<a href="mailto:$0">$0</a>');
		this.urls.storeAt(1, '<a href="$0">$0</a>');
	},
	
	patterns: {
		block_comment: /\/\*[^*]*\*+([^\/][^*]*\*+)*\//,
		email:         /([\w.+-]+@[\w.-]+\.\w+)/,
		line_comment:  /\/\/[^\r\n]*/,
		number:        /\b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b/,
		string1:       /'(\\.|[^'\\])*'/,
		string2:       /"(\\.|[^"\\])*"/,
		url:           /(http:\/\/+[\w\/\-%&#=.,?+$]+)/,
		
		comment:       ["block_comment", "line_comment"],
		string:        ["string1", "string2"],
		urls:          ["email", "url"]
	},
	
	urls: null,
	
	"@KHTML": {
		$FORMAT: '<span class="%1">$$%2</span>'
	}
});
