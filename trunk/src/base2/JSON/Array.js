
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
