var BoundaryNode = TreeNode.extend({
  constructor: function(token, pos) {
    this.base.apply(this, arguments);
    this.type = "boundary";
  },
  getBefore: function(i) {
    return this.token;
  }
});