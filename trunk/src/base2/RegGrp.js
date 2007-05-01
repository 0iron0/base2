
var RegGrp = Collection.extend({
	constructor: function(values, flags) {
		this.base(values);
		if (typeof flags == "string") {
			this.global = /g/.test(flags);
			this.ignoreCase = /i/.test(flags);
		}
	},

	global: true, // global is the default setting
	ignoreCase: false,

	exec: function(string, replacement) {
		if (arguments.length == 1) {
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
								return replacement.apply(null, slice(arguments, offset));
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

	test: function(string) {
		return this.exec(string) != string;
	},
	
	toString: function() {
		var length = 0;
		return "(" + this.map(function(item) {
			// fix back references
			var expression = String(item).replace(/\\(\d+)/g, function($, index) {
				return "\\" + (1 + Number(index) + length);
			});
			length += item.length + 1;
			return expression;
		}).join(")|(") + ")";
	}
}, {
	IGNORE: "$0",
	
	init: function() {
		forEach ("add,exists,fetch,remove,store".split(","), function(name) {
			extend(this, name, function(expression) {
				if (instanceOf(expression, RegExp)) {
					expression = expression.source;
				}
				return base(this, arguments);
			});
		}, this.prototype);
	}
});
