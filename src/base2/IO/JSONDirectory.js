
var JSONDirectory = Directory.extend(null, {
	create: function(name, item) {
		if (!instanceOf(item, this.Item)) {
			item = new this.Item(name, typeof item == "object", item && item.length);
		}
		return item;
	}
});
