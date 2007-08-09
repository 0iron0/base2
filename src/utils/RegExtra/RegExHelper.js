
var RegExHelper = Base.extend({
  constructor: function(source, flags) {
    var parser = new RegExpParser();
    this.tree = parser.exec(source);
    this.source = source;
  },
  
  getTreeAsHTML: function() {
    return this.tree.toHTML();
  },
  
  getTreeAsString: function() {
    return this.tree.toString();
  },
  
  getMatchSymbolCount: function() {
    return this.tree.getCount();
  }
  
});
