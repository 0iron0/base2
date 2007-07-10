// timestamp: Tue, 10 Jul 2007 18:26:33

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSON/namespace.js
// =========================================================================

// This code is loosely based on Douglas Crockford's original:
//	http://www.json.org/json.js

// This is not a particularly great implementation. I hacked it together to
//  support another project. It seems to work well enough though.

var JSON = new base2.Namespace(this, {
	name:    "JSON",
	version: "0.4",
	
	VALID: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/,
	
	copy: function(object) {
		// use JSON to make a deep copy of an object
		return this.parse(this.toString(object));
	},
	
	parse: function(string) {
		return this.String.parseJSON(string);
	}
});

eval(this.imports);

extend(JSON, "toString", function(object) {
	if (arguments.length == 0) return this.base();
	// find the appropriate module
	var module = this.Object; // default
	try {
		forEach (this, function(property, name) {
			if (name != "Object" && instanceOf(property.prototype, Module) && instanceOf(object, window[name])) {
				module = property;
				throw StopIteration;
			}
		});
	} catch (error) {
		if (error != StopIteration) throw error;
	}
	return module.toJSONString(object);
});

// =========================================================================
// JSON/Object.js
// =========================================================================

JSON.Object = Module.extend({
	toJSONString: function(object) {
		return object === null ? "null" : "{" + reduce(object, function(properties, property, name) {
			if (JSON.Object.isValid(property)) {
				properties.push(JSON.String.toJSONString(name) + ":" + JSON.toString(property));
			}
			return properties;
		}, []).join(",") + "}";
	}
}, {
	VALID_TYPE: /object|boolean|number|string/,
	
	isValid: function(object) {
		return this.VALID_TYPE.test(typeof object);
	}
});

// =========================================================================
// JSON/Array.js
// =========================================================================

JSON.Array = JSON.Object.extend({
	toJSONString: function(array) {
		return "[" + reduce(array, function(items, item) {
			if (JSON.Object.isValid(item)) {
				items.push(JSON.toString(item));
			}
			return items;
		}, []).join(",") + "]";
	}
});

// =========================================================================
// JSON/Boolean.js
// =========================================================================

JSON.Boolean = JSON.Object.extend({
	toJSONString: function(bool) {
		return String(bool);
	}
});

// =========================================================================
// JSON/Date.js
// =========================================================================

JSON.Date = JSON.Object.extend({
	toJSONString: function(date) {
		var pad = function(n) {
			return n < 10 ? "0" + n : n;
		};	
		return '"' + date.getFullYear() + "-" +
			pad(date.getMonth() + 1) + "-" +
			pad(date.getDate()) + "T" +
			pad(date.getHours()) + ":" +
			pad(date.getMinutes()) + ":" +
			pad(date.getSeconds()) + '"';
	}
});

// =========================================================================
// JSON/Number.js
// =========================================================================

JSON.Number = JSON.Object.extend({
	toJSONString: function(number) {
		return isFinite(number) ? String(number) : "null";
	}
});

// =========================================================================
// JSON/String.js
// =========================================================================

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

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
