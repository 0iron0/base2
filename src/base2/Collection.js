
// A Hash that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, store, insertAt, storeAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var _KEYS = "~";

var Collection = Hash.extend({
	constructor: function(values) {
		this[_KEYS] = new Array2;
		this.base(values);
	},
	
	add: function(key, item) {
		// Duplicates not allowed using add().
		// But you can still overwrite entries using store().
		assert(!this.exists(key), "Duplicate key '" + key + "'.");
		return this.store.apply(this, arguments);
	},

	copy: function() {
		var copy = this.base();
		copy[_KEYS] = this[_KEYS].copy();
		return copy;
	},

	count: function() {
		return this[_KEYS].length;
	},

	fetchAt: function(index) { // optimised (refers to _HASH)
		if (index < 0) index += this[_KEYS].length; // starting from the end
		var key = this[_KEYS][index];
		if (key !== undefined) return this[_HASH + key];
	},

	forEach: function(block, context) { // optimised (refers to _HASH)
		var keys = this[_KEYS];
		var length = keys.length, i;
		for (i = 0; i < length; i++) {
			block.call(context, this[_HASH + keys[i]], keys[i], this);
		}
	},

	indexOf: function(key) {
		return this[_KEYS].indexOf(String(key));
	},

	insertAt: function(index, key, item) {
		assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
		assert(!this.exists(key), "Duplicate key '" + key + "'.");
		this[_KEYS].insertAt(index, String(key));
		return this.store.apply(this, arguments);
	},
	
	item: Undefined, // alias of fetchAt (defined when the class is initialised)

	keys: function(index, length) {
		switch (arguments.length) {
			case 0:  return this[_KEYS].copy();
			case 1:  return this[_KEYS].item(index);
			default: return this[_KEYS].slice(index, length);
		}
	},

	remove: function(key) {
		// The remove() method of the Array object can be slow so check if the key exists first.
		var keyDeleted = arguments[1];
		if (keyDeleted || this.exists(key)) {
			if (!keyDeleted) {                   // The key has already been deleted by removeAt().
				this[_KEYS].remove(String(key)); // We still have to delete the value though.
			}
			return this.base(key);
		}
	},

	removeAt: function(index) {
		var key = this[_KEYS].removeAt(index);
		if (key !== undefined) return this.remove(key, true);
	},

	reverse: function() {
		this[_KEYS].reverse();
		return this;
	},

	sort: function(compare) { // optimised (refers to _HASH)
		if (compare) {
			var self = this;
			this[_KEYS].sort(function(key1, key2) {
				return compare(self[_HASH + key1], self[_HASH + key2], key1, key2);
			});
		} else this[_KEYS].sort();
		return this;
	},

	store: function(key, item) {
		if (arguments.length == 1) item = key;
		if (!this.exists(key)) {
			this[_KEYS].push(String(key));
		}
		var klass = this.constructor;
		if (klass.Item && !instanceOf(item, klass.Item)) {
			item = klass.create.apply(klass, arguments);
		}
		return this[_HASH + key] = item;
	},

	storeAt: function(index, item) {
		assert(Math.abs(index) < this[_KEYS].length, "Index out of bounds.");
		arguments[0] = this[_KEYS].item(index);
		return this.store.apply(this, arguments);
	},

	toString: function() {
		return String(this[_KEYS]);
	}
}, {
	Item: null, // If specified, all members of the collection must be instances of Item.
	
	init: function() {
		this.prototype.item = this.prototype.fetchAt;
	},
	
	create: function(key, item) {
		if (this.Item) return new this.Item(key, item);
	},
	
	extend: function(_instance, _static) {
		var klass = this.base(_instance);
		klass.create = this.create;
		extend(klass, _static);
		if (!klass.Item) {
			klass.Item = this.Item;
		} else if (typeof klass.Item != "function") {
			klass.Item = (this.Item || Base).extend(klass.Item);
		}
		klass.init();
		return klass;
	}
});
