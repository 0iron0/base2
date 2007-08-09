
var JSONDirectory = Directory.extend(null, {
  create: function(name, item) {
    return new this.Item(name, typeof item == "object", item && item.length);
  }
});
