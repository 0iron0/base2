
// A Hash that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.
// e.g.
//     var Dates = Collection.extend();                 // create a collection class
//     Dates.Item = Date;                               // only JavaScript Date objects allowed as members
//     var appointments = new Dates();                  // instantiate the class
//     appointments.add(appointmentId, new Date);       // add a date
//     appointments.add(appointmentId, "tomorrow");     // ERROR!

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, store, insertAt, replaceAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var Collection = Hash.extend({
	add: function(key, item) {
		// Duplicates not allowed using add().
		//  - but you can still overwrite entries using store()
		assert(!this.exists(key), "Duplicate key.");
		return this.store.apply(this, arguments);
	},

	count: function() {
		return this[KEYS].length;
	},

	indexOf: function(key) {
		return this[KEYS].indexOf(String(key));
	},

	insertAt: function(index, key, item) {
		assert(!this.exists(key), "Duplicate key.");
		this[KEYS].insertAt(index, String(key));
		return this.store.apply(this, slice(arguments, 1));
	},

	item: function(index) {
		return this.fetch(this[KEYS][index]);
	},

	removeAt: function(index) {
		return this.remove(this[KEYS][index]);
	},

	reverse: function() {
		this[KEYS].reverse();
		return this;
	},

	sort: function(compare) {
		if (compare) {
			var self = this;
			this[KEYS].sort(function(key1, key2) {
				return compare(self.fetch(key1), self.fetch(key2), key1, key2);
			});
		} else this[KEYS].sort();
		return this;
	},

	store: function(key, item) {
		if (arguments.length == 1) item = key;
		item = this.constructor.create.apply(this.constructor, arguments);
		return this.base(key, item);
	},

	storeAt: function(index, item) {
		assert(index < this.count(), "Index out of bounds.");
		arguments[0] = this[KEYS][index];
		return this.store.apply(this, arguments);
	}
}, {
	Item: null, // if specified, all members of the Collection must be instances of Item
	
	create: function(key, item) {
		if (this.Item && !instanceOf(item, this.Item)) {
			item = new this.Item(key, item);
		}
		return item;
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
		if (typeof klass.init == "function") klass.init();
		return klass;
	}
});
