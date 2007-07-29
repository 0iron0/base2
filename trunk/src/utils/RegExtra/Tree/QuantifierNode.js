var QuantifierNode = TreeNode.extend({
  constructor: function(token, pos) {
    this.base.apply(this, arguments);
    this.type = "quantifier";
  },

  getBefore: function(i) {
    return "";
  },
  
  getAfter: function(i) {
    return this.token;
  }  
});