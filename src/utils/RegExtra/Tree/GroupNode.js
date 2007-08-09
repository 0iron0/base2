
var GroupNode = TreeNode.extend({
  constructor: function(token, data) {
    this.base.apply(this, arguments);
    this.type = "group";
  },
  
  getBefore: function(i) {
    return this.token;
  },
  
  getAfter: function(i) {
    return ")";
  }  
});
