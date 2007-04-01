
var Enumerable = Module.extend({
	every: function(object, test, context) {
		var result = true;
		try {
			this.forEach (object, function(value, key) {
				result = test.call(context, value, key, object);
				if (!result) throw StopIteration;
			});
		} catch (error) {
			if (error != StopIteration) throw error;
		}
		return !!result; // cast to boolean
	},
	
	filter: function(object, test, context) {
		return this.reduce(object, new Array2, function(result, value, key) {
			if (test.call(context, value, key, object)) {
				result[result.length] = value;
			}
			return result;
		});
	},

	invoke: function(object, method) {
		// apply a method to each item in the enumerated object
		var args = slice(arguments, 2);
		return this.map(object, (typeof method == "function") ? function(item) {
			if (item != null) return method.apply(item, args);
		} : function(item) {
			if (item != null) return item[method].apply(item, args);
		});
	},
	
	map: function(object, block, context) {
		var result = new Array2;
		this.forEach (object, function(value, key) {
			result[result.length] = block.call(context, value, key, object);
		});
		return result;
	},
	
	pluck: function(object, key) {
		return this.map(object, function(item) {
			if (item != null) return item[key];
		});
	},
	
	reduce: function(object, result, block, context) {
		this.forEach (object, function(value, key) {
			result = block.call(context, result, value, key, object);
		});
		return result;
	},
	
	some: function(object, test, context) {
		return !this.every(object, function(value, key) {
			return !test.call(context, value, key, object);
		});
	}
}, {
	forEach: forEach
});
