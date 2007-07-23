
RegGrp.Item = Base.extend({
	constructor: function(expression, replacement) {
		expression = instanceOf(expression, RegExp) ? expression.source : String(expression);
		
		if (typeof replacement == "number") replacement = String(replacement);
		else if (replacement == null) replacement = "";		
		
		// does the pattern use sub-expressions?
		if (typeof replacement == "string" && /\$(\d+)/.test(replacement)) {
			// a simple lookup? (e.g. "$2")
			if (/^\$\d+$/.test(replacement)) {
				// store the index (used for fast retrieval of matched strings)
				replacement = parseInt(replacement.slice(1));
			} else { // a complicated lookup (e.g. "Hello $2 $1")
				// build a function to do the lookup
				var Q = /'/.test(replacement.replace(/\\./g, "")) ? '"' : "'";
				replacement = replacement.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q +
					"+(arguments[$1]||" + Q+Q + ")+" + Q);
				replacement = new Function("return " + Q + replacement.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q);
			}
		}
		
		this.length = RegGrp.count(expression);
		this.replacement = replacement;
		this.toString = partial(String, expression);
	},
	
	length: 0,
	replacement: ""
});
