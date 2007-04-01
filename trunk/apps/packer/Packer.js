/*
	Packer version 3.0 (beta) - copyright 2004-2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

eval(base2.namespace);

var IGNORE = RegGrp.IGNORE;
var REMOVE = "";
var SPACE = " ";
var WORDS = /\w+/g;

var Packer = Base.extend({
	minify: function(script) {
		script = Packer.clean.exec(script);
		script = Packer.whitespace.exec(script);
		script = Packer.clean.exec(script); // seem to grab a few more bytes on the second pass
		return script;
	},
	
	pack: function(script, shrink, base62) {
		script = this.minify(script);
		if (shrink) script = this._shrinkVariables(script);
		if (base62) script = this._base62Encode(script);		
		return script;
	},
	
	_base62Encode: function(script) {		
		var words = new Words(script);		
		var encode = function(word) {
			return words.fetch(word).encoded;
		};
		
		/* build the packed script */
		
		var p = this._escape(script.replace(WORDS, encode));		
		var a = Math.min(Math.max(words.count(), 2), 62);		
		var c = words.count();		
		var k = words;
		var e = Packer["ENCODE" + (a > 10 ? a > 36 ? 62 : 36 : 10)];
		var d = a > 10 ? "e(c)" : "c";
		
		// the whole thing
		return format(Packer.UNPACK, p,a,c,k,e,d);
	},
	
	_escape: function(script) {
		return script.replace(/([\\'])/g, "\\$1");
	},
	
	_shrinkVariables: function(script) {
		// encode strings and regular expressions
		var data = [];
		var store = function(string) {
			var replacement = "#" + data.length;
			data.push(string);
			return replacement;
		};
		// do the encoding
		script = Packer.data.exec(script, store);
		
		// remove closures (this is for base2 namespaces)
		script = script.replace(/(^|[\n;])\s*new\s+function\s*\(\)\s*\{/g, "$1{;#;");
		
		// Base52 encoding (a-Z)
		var encode52 = function(c) {
			return (c < 52 ? '' : arguments.callee(parseInt(c / 52))) +
				((c = c % 52) > 25 ? String.fromCharCode(c + 39) : String.fromCharCode(c + 97));
		};
				
		// identify blocks, particularly identify function blocks (which define scope)
		var BLOCK = /(function\s*([\w$]+\s*)?\(\s*([\w$\s,]*)\s*\)\s*)?(\{([^\{\}]*)\})/g;
		var blocks = []; // store program blocks (anything between braces {})
		
		// decoder for program blocks
		var decode = function(script) {			
			while (/~\d+/.test(script)) {
				script = script.replace(/~(\d+)/g, function(match, index) {
					return blocks[index];
				});
			}
			return script;
		};
		
		// encoder for program blocks
		var VAR_ = /var\s+/g;
		var VAR_NAME = /var\s+[\w$]{2,}/g;
		var COMMA = /\s*,\s*/;
		var encode = function(block, func, name, args) {
			if (func) { // the block is a function block
				
				// decode the function block (THIS IS THE IMPORTANT BIT)
				// We are retrieving all sub-blocks and will re-parse them in light
				// of newly shrunk variables
				block = decode(block);
				
				// create the list of variable and argument names 
				var vars = match(block, VAR_NAME).join(",").replace(VAR_, "");
				var ids = Array2.combine(args.split(COMMA).concat(vars.split(COMMA)));
				
				// process each identifier
				var count = 0, shortId;
				forEach (ids, function(id) {
					id = rescape(trim(id));
					if (id) {
						// find the next free short name (check everything in the current scope)
						do shortId = encode52(count++);
						while (new RegExp("[^\\w$.]" + shortId + "[^\\w$:]", "g").test(block));
						// replace the long name with the short name
						var reg = new RegExp("([^\\w$.])" + id + "([^\\w$:])", "g");
						while (reg.test(block)) block = block.replace(reg, "$1" + shortId + "$2");
						var reg = new RegExp("([^{,])" + id + ":", "g");
						block = block.replace(reg, "$1" + shortId + ":");
					}
				});
			}
			var replacement = "~" + blocks.length;
			blocks.push(block);
			return replacement;
		};
		
		// encode blocks, as we encode we replace variable and argument names
		while (BLOCK.test(script)) {
			script = script.replace(BLOCK, encode);
		}
		// decode (put the blocks back)
		script = decode(script);
		
		// put back the closure (for base2 namespaces only)
		script = script.replace(/\{;#;/g, "new function(){");
		
		// put strings and regular expressions back
		while (/#\d+/.test(script)) {
			script = script.replace(/#(\d+)/g, function(match, index) {		
				return data[index];
			});
		}
		
		return script;
	}
}, {
	ENCODE10: "String",
	ENCODE36: "function(c){return c.toString(a)}",
	ENCODE62: "function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))}",	
	UNPACK: "eval(function(p,a,c,k,e,d){e=%5;if(!''.replace(/^/,String)){while(c--)d[%6]=k[c]" +
	        "||%6;k=[function(e){return d[e]}];e=function(){return'\\\\w+'};c=1};while(c--)if(k[c])p=p." +
			"replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('%1',%2,%3,'%4'.split('|'),0,{}))",
	
	init: function() {
		this.clean = this.data.union(this.clean);
		this.whitespace = this.data.union(this.whitespace);
		this.whitespace.remove("(@\\*\\/[^\\n]*)\\n");
	},
	
	clean: {
		";;;[^\\n]*": REMOVE, // triple semi-colons treated like line comments
		"\\(\\s*;\\s*;\\s*\\)": "(;;)", // for (;;) loops
		"throw[^};]+[};]": IGNORE, // a safari bug
		";+\\s*([};])": "$1"
	},
	
	data: new RegGrp({
		// strings
		"'(\\\\.|[^'\\\\])*'": IGNORE,
		'"(\\\\.|[^"\\\\])*"': IGNORE,
		// line comment followed by a RegExp
		"(\\/\\/[^\\n]*)\\s+(\\/[^\\/*](\\\\.|[^\\/\\n\\\\])*\\/)": "$2",
		// MSIE conditional comment markers
		"\\/\\/@/": IGNORE,
		"\\/\\*@/": IGNORE,
		"(@\\/\\/[^\\n]*)\\n": "$1\\n",
		// line comment
		"\\/\\/[^\\n]*": REMOVE,
		// block comment
		"\\/\\*[^*@]*\\*+([^\\/][^*]*\\*+)*\\/": SPACE,
		// regular expressions
		"([^\\w$)\\]\\s+-])\\s*(\\/[^\\/*](\\\\.|[^\\/\\n\\\\])*\\/)": "$1$2"
	}),
	
	whitespace: {
		"(\\d)\\s+(\\.\\s*[a-z$_\\[\\(])": "$1 $2", // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
		"([+-])\\s+([+-])": "$1 $2", // c = a++ +b;
		"(\\b|\\$)\\s+(\\b|\\$)": "$1 $2",
		"\\s+": REMOVE
	}
});
