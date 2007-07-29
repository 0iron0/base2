var SetNode = TreeNode.extend({
  constructor: function(token, data) {
    this.base.apply(this, arguments);
    this.type = "set";
  },

  getBefore: function(i) {
    return this.token;
  },
  getAfter: function(i) {
    return "]";
  }
});