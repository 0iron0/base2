
var move = button.extend({
  onattach: function(button) {
    var self = this;
    function getBlock() {
      var block = button;
      while (block && !self.isBlock(block)) {
        block = block.parentNode;
      }
      return block;
    };
    function setDisabled() {
      var block = getBlock();
      while (block && (block = block[self.RELATIVE_NODE]) && !self.isBlock(block)) {
        continue;
      }
      button.disabled = !block;
    };
    var block = getBlock();
    if (block) {
      self.addEventListener(block.parentNode, "BlocksModified", setDisabled, false);
    }
    setDisabled();
  },

  onclick: function(button, event) {
    event.preventDefault(); // preent submit
    
    var block = button;
    while (block && !this.isBlock(block)) {
      block = block.parentNode;
    }
    if (block) {
      this.moveRepetitionBlock(block, this.DIRECTION);
    }
  }
});
