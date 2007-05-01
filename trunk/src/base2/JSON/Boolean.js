
JSON.Boolean = JSON.Object.extend({
	toJSONString: function(boolean) {
		return String(boolean);
	}
});
