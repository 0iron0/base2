
// A collection of Rule objects

var RuleList = Collection.extend({
  constructor: function(rules) {
    this.base(extend({}, rules));
  },
  
  refresh: function() {
    this.invoke("refresh");
  }
}, {
  Item: Rule
});
