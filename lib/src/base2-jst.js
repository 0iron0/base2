// timestamp: Tue, 26 Jun 2007 15:37:28

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JST/namespace.js
// =========================================================================

// JavaScript Templates

/*
	Based on the work of Erik Arvidsson:
		http://erik.eae.net/archives/2005/05/27/01.03.26/
*/

var JST = new base2.Namespace(this, {
	name:    "JST",
	version: "0.4",
	exports: "Command,Interpreter,Parser"
});

eval(this.imports);

// =========================================================================
// JST/Command.js
// =========================================================================

var STDOUT = 1;

var Command = Base.extend({
	constructor: function(command) {
		this[STDOUT] = [];		
		this.extend(command); // additional commands
	},
	
	echo: function(string) {
		this[STDOUT].push(string);
	}
});

// =========================================================================
// JST/Interpreter.js
// =========================================================================

var Interpreter = Base.extend({
	constructor: function(command) {
		this.command = command || {};
		this.parser = new Parser;
	},
	
	command: null,
	parser: null,
	
	interpret: function(template) {
		var command = new Command(this.command);
		var code = base2.namespace + "with(arguments[0]){" +
			this.parser.parse(template) + 
		"}return arguments[0][1].join('')";
		// use new Function() instead of eval() so that the script is evaluated in the global scope
		return new Function(code)(command);
	}
});

// =========================================================================
// JST/Escape.js
// =========================================================================

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

// =========================================================================
// JST/Parser.js
// =========================================================================

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

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
