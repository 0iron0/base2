
// Create a faux constructor that augments the built-in Array object.
var Array2 = _createObject2(
	Array,
	"concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", // generics
	[Enumerable, {
		combine: function(keys, values) {
			// Combine two arrays to make a hash.
			if (!values) values = keys;
			return this.reduce(keys, function(object, key, index) {
				object[key] = values[index];
				return object;
			}, {});
		},
		
		copy: function(array) {
			return this.concat(array);
		},
		
		contains: function(array, item) {
			return this.indexOf(array, item) != -1;
		},
		
		forEach: _Array_forEach,
		
		indexOf: function(array, item, fromIndex) {
			var length = array.length;
			if (fromIndex == null) {
				fromIndex = 0;
			} else if (fromIndex < 0) {
				fromIndex = Math.max(0, length + fromIndex);
			}
			for (var i = fromIndex; i < length; i++) {
				if (array[i] === item) return i;
			}
			return -1;
		},
		
		insertAt: function(array, item, index) {
			this.splice(array, index, 0, item);
			return item;
		},
		
		item: function(array, index) {
			if (index < 0) index += array.length; // starting from the end
			return array[index];
		},
		
		lastIndexOf: function(array, item, fromIndex) {
			var length = array.length;
			if (fromIndex == null) {
				fromIndex = length - 1;
			} else if (from < 0) {
				fromIndex = Math.max(0, length + fromIndex);
			}
			for (var i = fromIndex; i >= 0; i--) {
				if (array[i] === item) return i;
			}
			return -1;
		},
		
		remove: function(array, item) {
			var index = this.indexOf(array, item);
			if (index != -1) this.removeAt(array, index);
			return item;
		},
		
		removeAt: function(array, index) {
			return this.splice(array, index, 1);
		}
	}]
);

Array2.prototype.forEach = function(block, context) {
	_Array_forEach(this, block, context);
};
