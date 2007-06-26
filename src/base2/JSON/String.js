
JSON.String = JSON.Object.extend({
	parseJSON: function(string) {
		try {
			if (JSON.VALID.test(string
			//	.replace(/\\./g, '@')
			//	.replace(/"[^"\\\n\r]*"/g, '')
			)) {
				return eval("(" + string + ")");
			}
		} catch (error) {
			throw new SyntaxError("parseJSON");
		}
	},
	
	toJSONString: function(string) {
		return '"' + this.escape(string) + '"';
	}
}, {
	CTRL_CHAR: /[\x00-\x1f\\"]/g,
	ESCAPE: {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"' : '\\"',
		'\\': '\\\\'
	},
	
	escape: function(string) {
		var ESCAPE = this.ESCAPE;
		return String(string).replace(this.CTRL_CHAR, function(match) {
			var chr = ESCAPE[match];
			if (chr) return chr;
			chr = match.charCodeAt(0);
			return '\\u00' + Math.floor(chr / 16).toString(16) + (chr % 16).toString(16);
		});
	}
});
