
// A collection of Rule objects

var RuleList = Collection.extend({
  constructor: function(rules) {
    this.base(rules);
    this.globalize(); //-dean: make this optional
  },
  
  globalize: Call.defer(function() {
    // execution of this method is deferred until the DOMContentLoaded event
    var LIST = /[^\s,]+/g;
    var ID = /^#[\w-]+$/;
    forEach (this, function(rule, selector) {
      // add all ID selectors to the global namespace
      forEach (match(selector, LIST), function(selector) {
        if (ID.test(selector)) {
          var name = ViewCSS.toCamelCase(selector.slice(1));
          window[name] = Document.matchSingle(document, selector);
        }
      });
    });
  }, 10),
  
  refresh: function() {
    this.invoke("refresh");
  }
}, {
  Item: Rule
});
