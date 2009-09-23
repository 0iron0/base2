
var JSONDirectory = Directory.extend(null, {

  create: function(name, item) {
    return new this.Item(name, typeof item == "object", typeof item == "string" ? item.length : 0);
  }
  
});
