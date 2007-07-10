
var RegGrp = Base.extend({
	constructor: function(values, flags) {
		this.keys = [];
		this.values = {};
		this.merge(values);
		if (typeof flags == "string") {
			this.global = /g/.test(flags);
			this.ignoreCase = /i/.test(flags);
		}
	},

	global: true, // global is the default setting
	ignoreCase: false,
	keys: null,
	values: null,
	
	add: function(expression, replacement) {
		if (!this.values["#" + expression]) this.keys.push(String(expression));
		this.values["#" + expression] = new RegGrp.Item(expression, replacement);
	},

	exec: function(string, replacement) {
		if (arguments.length == 1) {
			var self = this;
			replacement = function(match) {
				if (!match) return "";
				var offset = 1, i = 0;
				// loop through the values
				while (match = self.item(i++)) {
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

	item: function(index) {
		return this.values["#" + this.keys[index]];
	},
	
	merge: function(values) {
		forEach (arguments, function(values) {
			forEach (values, function(replacement, expression) {
				this.add(expression, replacement);
			}, this);
		}, this);
		return this;
	},

	test: function(string) {
		return this.exec(string) != string;
	},
	
	toString: function() {
		return "(" + this.keys.join(")|(") + ")";
	}
}, {
	IGNORE: "$0"
});
