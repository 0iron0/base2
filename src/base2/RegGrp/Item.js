
RegGrp.Item = Base.extend({
	constructor: function(expression, replacement) {
		var ESCAPE = /\\./g;
		var STRING = /(['"])\1\+(.*)\+\1\1$/;
	
		expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
		
		if (typeof replacement == "number") replacement = String(replacement);
		else if (replacement == null) replacement = "";
		
		// count the number of sub-expressions
		//  - add one because each pattern is itself a sub-expression
		this.length = match(expression.replace(ESCAPE, "").replace(/\[[^\]]+\]/g, ""), /\(/g).length;
		
		// does the pattern use sub-expressions?
		if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
			// a simple lookup? (e.g. "$2")
			if (/^\$\d+$/.test(replacement)) {
				// store the index (used for fast retrieval of matched strings)
				replacement = parseInt(replacement.slice(1));
			} else { // a complicated lookup (e.g. "Hello $2 $1")
				// build a function to do the lookup
				var i = this.length + 1;
				var Q = /'/.test(replacement.replace(ESCAPE, "")) ? '"' : "'";
				replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
					"+(arguments[$1]||" + Q+Q + ")+" + Q);
				replacement = new Function("return " + Q + replacement.replace(STRING, "$1") + Q);
			}
		}
		this.replacement = replacement;
		this.toString = function() {
			return expression || "";
		};
	},
	
	length: 0,
	replacement: ""
});
