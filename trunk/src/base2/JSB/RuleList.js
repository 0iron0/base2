
// A collection of Rule objects

var RuleList = Collection.extend({
  constructor: function(rules, context) {
    this.base(rules);
    this.globalize(); //-dean: make this optional
    this.context = context;
    this.refresh();
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
          window[name] = Document.querySelector(document, selector);
        }
      });
    });
  }, 10),
  
  refresh: function(context) {
    this.invoke("refresh", context||this.context);
  }
}, {
  Item: Rule
});
