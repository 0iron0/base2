
var HASH   = "#";
var KEYS   = HASH + "keys";
var VALUES = HASH + "values";

var RegGrp = Base.extend({
	constructor: function(values, flags) {
		this[KEYS] = [];
		this[VALUES] = {};
		this.merge(values);
		if (typeof flags == "string") {
			this.global = /g/.test(flags);
			this.ignoreCase = /i/.test(flags);
		}
	},

	global: true, // global is the default setting
	ignoreCase: false,
	
	add: function(expression, replacement) {
		if (!this[VALUES][HASH + expression]) this[KEYS].push(String(expression));
		this[VALUES][HASH + expression] = new RegGrp.Item(expression, replacement);
	},

	exec: function(string, replacement) {
		if (arguments.length == 1) {
			var self = this;
			var keys = this[KEYS];
			var values = this[VALUES];
			replacement = function(match) {
				if (!match) return "";
				var offset = 1, i = 0;
				// loop through the values
				while (match = values[HASH + keys[i++]]) {
					// do we have a result?
					if (arguments[offset]) {
						var replacement = match.replacement;
						switch (typeof replacement) {
							case "function":
								return replacement.apply(self, slice(arguments, offset));
							case "number":
								return arguments[offset + replacement];
							default:
								return replacement;
						}
					// no? then skip over references to sub-expressions
					} else offset += match.length + 1;
				}
			};
		}
		var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
		return String(string).replace(new RegExp(this, flags), replacement);
	},

	item: function(index) {
		return this[VALUES][HASH + this[KEYS][index]];
	},
	
	merge: function(values) {
		for (var i in values) this.add(i, values[i]);
		return this;
	},
	
	toString: function() {
		return "(" + this[KEYS].join(")|(") + ")";
	}
}, {
	IGNORE: "$0"
});
