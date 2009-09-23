
// A collection of Rule objects

var RuleList = Collection.extend({
  put: function(key, value) { // allow feature detection
    key = String(key);
    if (key.indexOf("@") == 0) {
      if (detect(key.slice(1))) this.merge(value);
    } else {
      this.base.apply(this, arguments);
    }
  },
  
  refresh: function() {
    this.invoke("refresh");
  }
}, {
  Item: Rule
});
