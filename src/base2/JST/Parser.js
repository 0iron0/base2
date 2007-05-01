
// this needs a re-write but it works well enough for now.

var Parser = Base.extend({
	escapeChar: "\\",
	
	parse: function(string) {
		return this._decode(this._encode(String(string)));
	},
	
	_decode: function(string) {
		var evaluated = this._evaluated;
		while (Parser.EVALUATED.test(string)) {
			string = string.replace(Parser.EVALUATED, function(match, index) {
				return evaluated[index];
			});
		}
		delete this._evaluated;
		return this.unescape(string);
	},
	
	_encode: function(string) {		
		var TRIM = /^=|;+$/g;
		var BLOCK = /<%[^%]*%([^>][^%]*%)*>/g;
		var evaluated = this._evaluated = [];
		var evaluate = function(match) {
			match = match.replace(Parser.TRIM, "");
			if (!match) return "";
			if (match.charAt(0) == "=") {
				match = "\necho(" + match.replace(TRIM, "") + ");";
			}
			var replacement = "\x01" + evaluated.length;
			evaluated.push(match);
			return replacement;
		};
		return Parser.TEXT.exec(this.escape(string).replace(BLOCK, evaluate));
	}
}, {
	ESCAPE: /\\|\"|\n|\r/g,
	EVALUATED: /\x01(\d+)/g,
	TEXT: new RegGrp({
		"\\x01\\d+": RegGrp.IGNORE,
		"[^\\x01]+": function(match) {
			return '\necho("' + Parser.escape(match) + '");';
		}
	}),
	TRIM: /^<%\-\-.*\-\-%>$|^<%\s*|\s*%>$/g,
	
	escape: function(string) {
		return string.replace(this.ESCAPE, this.format);
	},
	
	format: function(chr) {
		switch (chr) {
			case "\\": return "\\\\";
			case "\"": return "\\\"";
			case "\n": return "\\n";
			case "\r": return "\\r";
		}
	}
});

Parser.implement(Escape);
