
// A collection of regular expressions and their associated replacement values.

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

	exec: function(string, replacement) { // optimised (refers to _HASH)
		string = String(string); // type-safe
		if (arguments.length == 1) {
			var self = this;
			var keys = this[_KEYS];
			replacement = function(match) {
				if (!match) return "";
				var item, offset = 1, i = 0;
				// Loop through the RegGrp items.
				while (item = self[_HASH + keys[i++]]) {
					var next = offset + item.length + 1;
					if (arguments[offset]) { // do we have a result?
						var replacement = item.replacement;
						switch (typeof replacement) {
							case "function":
								var args = slice(arguments, offset, next);
								var index = arguments[arguments.length - 2];
								return replacement.apply(self, args.concat(index, string));
							case "number":
								return arguments[offset + replacement];
							default:
								return replacement;
						}
					}
					offset = next;
				}
			};
		}
		return string.replace(this.valueOf(), replacement);
	},

	test: function(string) {
		return this.exec(string) != string;
	},
	
	toString: function() {
		var BACK_REF = /\\(\d+)/g;
		var length = 0;
		return "(" + this.map(function(item) {
			// Fix back references.
			var ref = String(item).replace(BACK_REF, function(match, index) {
				return "\\" + (1 + Number(index) + length);
			});
			length += item.length + 1;
			return ref;
		}).join(")|(") + ")";
	},
	
	valueOf: function(type) {
		if (type == "object") return this;
		var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
		return new RegExp(this, flags);
	}
}, {
	IGNORE: "$0",
	
	count: function(expression) {
		// Count the number of sub-expressions in a RegExp/RegGrp.Item.
		return match(String(expression).replace(/\\./g, "").replace(/\(\?[:=!]|\[[^\]]+\]/g, ""), /\(/g).length;
	},
	
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
