
// A Map that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static create() method is responsible for all construction of collection items.
// Instance methods that add new items (add, put, insertAt, putAt) pass *all* of their arguments
// to the static create() method. If you want to modify the way collection items are 
// created then you only need to override this method for custom collections.

var _KEYS = "~";

var Collection = Map.extend({
  constructor: function(values) {
    this[_KEYS] = new Array2;
    this.base(values);
  },
  
  add: function(key, item) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    if (this.has(key)) throw "Duplicate key '" + key + "'.";
    this.put.apply(this, arguments);
  },

  clear: function() {
    this.base();
    this[_KEYS].length = 0;
  },

  copy: function() {
    var copy = this.base();
    copy[_KEYS] = this[_KEYS].copy();
    return copy;
  },

  forEach: function(block, context) {
    var keys = this[_KEYS];
    var length = keys.length;
    for (var i = 0; i < length; i++) {
      block.call(context, this[_HASH + keys[i]], keys[i], this);
    }
  },

  getAt: function(index) {
    var key = this[_KEYS].item(index);
    return (key === undefined)  ? undefined : this[_HASH + key];
  },

  getKeys: function() {
    return this[_KEYS].copy();
  },

  indexOf: function(key) {
    return this[_KEYS].indexOf(String(key));
  },

  insertAt: function(index, key, item) {
    if (this[_KEYS].item(index) == null) throw "Index out of bounds.";
    if (this.has(key)) throw "Duplicate key '" + key + "'.";
    this[_KEYS].insertAt(index, String(key));
    this[_HASH + key] = null; // placeholder
    this.put.apply(this, _slice.call(arguments, 1));
  },

  item: function(keyOrIndex) {
    return this[typeof keyOrIndex == "number" ? "getAt" : "get"](keyOrIndex);
  },

  put: function(key, item) {
    var klass = this.constructor;
    if (klass.Item && !instanceOf(item, klass.Item)) {
      item = klass.create.apply(klass, arguments);
    }
    if (!this.has(key)) {
      this[_KEYS].push(String(key));
    }
    this[_HASH + key] = item;
    return item;
  },

  putAt: function(index, item) {
    arguments[0] = this[_KEYS].item(index);
    if (arguments[0] == null) throw "Index out of bounds.";
    this.put.apply(this, arguments);
  },

  remove: function(key) {
    // The remove() method of the Array object can be slow so check if the key exists first.
    if (this.has(key)) {
      this[_KEYS].remove(String(key));
      delete this[_HASH + key];
    }
  },

  removeAt: function(index) {
    var key = this[_KEYS].item(index);
    if (key !== undefined) {
      this[_KEYS].removeAt(index);
      delete this[_HASH + key];
    }
  },

  reverse: function() {
    this[_KEYS].reverse();
    return this;
  },

  size: function() {
    return this[_KEYS].length;
  },

  slice: function(start, end) {
    var sliced = this.copy();
    if (arguments.length > 0) {
      var keys = this[_KEYS], removed = keys;
      sliced[_KEYS] = Array2(_slice.apply(keys, arguments));
      if (sliced[_KEYS].length) {
        removed = removed.slice(0, start);
        if (arguments.length > 1) {
          removed = removed.concat(keys.slice(end));
        }
      }
      for (var i = 0; i < removed.length; i++) {
        delete sliced[_HASH + removed[i]];
      }
    }
    return sliced;
  },

  sort: function(compare) { // optimised (refers to _HASH)
    if (compare) {
      this[_KEYS].sort(bind(function(key1, key2) {
        return compare(this[_HASH + key1], this[_HASH + key2], key1, key2);
      }, this));
    } else this[_KEYS].sort();
    return this;
  },

  toString: function() {
    return "(" + (this[_KEYS] || "") + ")";
  }
}, {
  Item: null, // If specified, all members of the collection must be instances of Item.
  
  create: function(key, item) {
    return this.Item ? new this.Item(key, item) : item;
  },
  
  extend: function(_instance, _static) {
    var klass = this.base(_instance);
    klass.create = this.create;
    if (_static) extend(klass, _static);
    if (!klass.Item) {
      klass.Item = this.Item;
    } else if (typeof klass.Item != "function") {
      klass.Item = (this.Item || Base).extend(klass.Item);
    }
    if (klass.init) klass.init();
    return klass;
  }
});
