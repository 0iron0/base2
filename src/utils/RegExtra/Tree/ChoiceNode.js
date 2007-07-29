var ChoiceNode = TreeNode.extend({
  constructor: function(token, pos) {
    this.base.apply(this, arguments);
    this.type = "choice";
  },
  
  getBefore: function(i) {
    return i > 0 ? this.token : "";
  }
});