
// fix String.replace (Safari/IE5.0)
if ("".replace(/^/, String)) {
	var _GLOBAL = /(g|gi)$/;
	extend(String.prototype, "replace", function(expression, replacement) {
		if (typeof replacement == "function") { // Safari doesn't like functions
			if (instanceOf(expression, RegExp)) {
				var regexp = expression;
				var global = regexp.global;
				if (global == null) global = _GLOBAL.test(regexp);
				// we have to convert global RexpExps for exec() to work consistently
				if (global) regexp = new RegExp(regexp.source); // non-global
			} else {
				regexp = new RegExp(rescape(expression));
			}
			var match, string = this, result = "";
			while (string && (match = regexp.exec(string))) {
				result += string.slice(0, match.index) + replacement.apply(this, match);
				string = string.slice(match.index + match[0].length);
				if (!global) break;
			}
			return result + string;
		}
		return this.base(expression, replacement);
	});
}
