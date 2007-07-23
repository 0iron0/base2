
var _HASH   = "#";
var _KEYS   = "~";

var RegGrp = Base.extend({
	constructor: function(values, flags) {
		this[_KEYS] = [];
		this.merge(values);
		if (typeof flags == "string") {
			this.global = /g/.test(flags);
			this.ignoreCase = /i/.test(flags);
		}
	},

	global: true, // global is the default setting
	ignoreCase: false,
	
	add: function(expression, replacement) {
		if (!this[_HASH + expression]) this[_KEYS].push(String(expression));
		this[_HASH + expression] = new RegGrp.Item(expression, replacement);
	},

	exec: function(string, replacement) {
		string = String(string); // type safe
		if (arguments.length == 1) {
			var keys = this[__KEYS];
			var items = this;
			replacement = function(match) {
				if (!match) return "";
				var item;
				var offset = 1, i = 0;
				// Loop through the RegGrp items.
				while (item = items[_HASH + keys[i++]]) {
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
		var flags = (this.global ? "g" : "") + (this.ignoreCase ? "i" : "");
		return string.replace(new RegExp(this, flags), replacement);
	},

	item: function(index) {
		return this[_HASH + this[_KEYS][index]];
	},
	
	merge: function(values) {
		for (var i in values) this.add(i, values[i]);
		return this;
	},
	
	toString: function() {
		// back references not supported in simple RegGrp
		return "(" + this[_KEYS].join(")|(") + ")";
	}
}, {
	IGNORE: "$0",
	
	count: function(expression) {
		// Count the number of sub-expressions in a RegExp/RegGrp.Item.
		return (String(expression).replace(/\\./g, "").replace(/\(\?[:=!]|\[[^\]]+\]/g, "").match(/\(/g) || "").length;
	}
});
