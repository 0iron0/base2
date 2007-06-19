
// The IArray module implements all Array methods.
// This module is not public but its methods are accessible through the Array2 object (below). 

var IArray = Module.extend({
	combine: function(keys, values) {
		// combine two arrays to make a hash
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
	
	forEach: forEach.Array,
	
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
	
	insertBefore: function(array, item, before) {
		var index = this.indexOf(array, before);
		if (index == -1) this.push(array, item);
		else this.splice(array, index, 0, item);
		return item;
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
		var item = array[index];
		this.splice(array, index, 1);
		return item;
	}
});

IArray.prototype.forEach = function(block, context) {
	forEach.Array(this, block, context);
};

IArray.implement(Enumerable);

forEach ("concat,join,pop,push,reverse,shift,slice,sort,splice,unshift".split(","), function(name) {
	var method = Array.prototype[name];
	IArray[name] = function(array) {
		return method.apply(array, slice(arguments, 1));
	};
});

// create a faux constructor that augments the built-in Array object
var Array2 = function() {
	return IArray(this.constructor == IArray ? Array.apply(null, arguments) : arguments[0]);
};
// expose IArray.prototype so that it can be extended
Array2.prototype = IArray.prototype;

forEach (IArray, function(method, name, proto) {
	if (Array[name]) {
		IArray[name] = Array[name];
		delete IArray.prototype[name];
	}
	Array2[name] = IArray[name];
});
