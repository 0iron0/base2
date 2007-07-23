
var _HASH = "#";

var Hash = Base.extend({
	constructor: function(values) {
		this.merge(values);
	},

	copy: delegate(copy),

	// Ancient browsers throw an error when we use "in" as an operator.
	exists: function(key) {
		/*@cc_on @*/
		/*@if (@_jscript_version < 5.5)
			return $Legacy.exists(this, _HASH + key);
		@else @*/
			return _HASH + key in this;
		/*@end @*/
	},

	fetch: function(key) {
		return this[_HASH + key];
	},

	forEach: function(block, context) {
		for (var key in this) if (key.charAt(0) == _HASH) {
			block.call(context, this[key], key.slice(1), this);
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
		var value = this[_HASH + key];
		delete this[_HASH + key];
		return value;
	},

	store: function(key, value) {
		if (arguments.length == 1) value = key;
		// Create the new entry (or overwrite the old entry).
		return this[_HASH + key] = value;
	},

	union: function(values) {
		return this.merge.apply(this.copy(), arguments);
	}
});

Hash.implement(Enumerable);
