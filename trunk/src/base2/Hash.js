
var HASH = "#" + Number(new Date);
var KEYS = HASH + "keys";
var VALUES = HASH + "values";

var Hash = Base.extend({
	constructor: function(values) {
		this[KEYS] = new Array2;
		this[VALUES] = {};
		this.merge(values);
	},

	copy: function() {
		var copy = new this.constructor(this);
		Base.forEach (this, function(property, name) {
			if (typeof property != "function" && name.charAt(0) != "#") {
				copy[name] = property;
			}
		});
		return copy;
	},

	// ancient browsers throw an error when we use "in" as an operator 
	//  so we must create the function dynamically
	exists: Legacy.exists || new Function("k", format("return('%1'+k)in this['%2']", HASH, VALUES)),

	fetch: function(key) {
		return this[VALUES][HASH + key];
	},

	forEach: function(block, context) {
		forEach (this[KEYS], function(key) {
			block.call(context, this.fetch(key), key, this);
		}, this);
	},

	keys: function(index, length) {
		var keys = this[KEYS] || new Array2;
		switch (arguments.length) {
			case 0: return keys.copy();
			case 1: return keys[index];
			default: return keys.slice(index, length);
		}
	},

	merge: function(values) {
		forEach (arguments, function(values) {
			forEach (values, function(value, key) {
				this.store(key, value);
			}, this);
		}, this);
		return this;
	},

	remove: function(key) {
		var value = this.fetch(key);
		this[KEYS].remove(String(key));
		delete this[VALUES][HASH + key];
		return value;
	},

	store: function(key, value) {
		if (arguments.length == 1) value = key;
		// only store the key for a new entry
		if (!this.exists(key)) {
			this[KEYS].push(String(key));
		}
		// create the new entry (or overwrite the old entry)
		this[VALUES][HASH + key] = value;
		return value;
	},

	toString: function() {
		return String(this[KEYS]);
	},

	union: function(values) {
		return this.merge.apply(this.copy(), arguments);
	},

	values: function(index, length) {
		var values = this.map(K);
		switch (arguments.length) {
			case 0: return values;
			case 1: return values[index];
			default: return values.slice(index, length);
		}
	}
});

Hash.implement(Enumerable);
