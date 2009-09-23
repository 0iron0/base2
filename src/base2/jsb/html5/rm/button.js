
var button = element.extend({
  getBlock: function(button) {
    var block = button;
    
    while (block && !this.isBlock(block)) {
      block = block.parentNode;
    }
    return block;
  }
});
