
// http://wiki.ecmascript.org/doku.php?id=proposals:dictionary

var _HASH = "#";

var Map = Base.extend({
  constructor: function(values) {
    this.merge(values);
  },

  copy: delegate(copy),

  forEach: function(block, context) {
    for (var key in this) if (key.charAt(0) == _HASH) {
      block.call(context, this[key], key.slice(1), this);
    }
  },

  get: function(key) {
    return this[_HASH + key];
  },

  getKeys: function() {
    return this.map(flip(I));
  },

  getValues: function() {
    return this.map(I);
  },

  // Ancient browsers throw an error when we use "in" as an operator.
  has: function(key) {
  /*@cc_on @*/
  /*@if (@_jscript_version < 5.5)
    return $Legacy.has(this, _HASH + key);
  @else @*/
    return _HASH + key in this;
  /*@end @*/
  },

  merge: function(values) {
    var put = flip(this.put);
    forEach (arguments, function(values) {
      forEach (values, put, this);
    }, this);
    return this;
  },

  remove: function(key) {
    delete this[_HASH + key];
  },

  put: function(key, value) {
    if (arguments.length == 1) value = key;
    // create the new entry (or overwrite the old entry).
    this[_HASH + key] = value;
  },

  size: function() {
    // this is expensive because we are not storing the keys
    var size = 0;
    for (var key in this) if (key.charAt(0) == _HASH) size++;
    return size;
  },

  union: function(values) {
    return this.merge.apply(this.copy(), arguments);
  }
});

Map.implement(Enumerable);
