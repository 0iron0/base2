var RangeNode = TreeNode.extend({
  constructor: function(token, data) {
    this.base.apply(this, arguments);
    this.type = "range";
  },
  
  stringChildAround: function(s, i) {
    return this.base(s, i) + (i==0 ? '<code class="range">-</code>' : "");
  }
});