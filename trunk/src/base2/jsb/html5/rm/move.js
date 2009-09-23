
var move = button.extend({
  onattach: function(button) {
    var self = this;
    function setDisabled() {
      var block = self.getBlock(button);
      while (block && (block = block[self.RELATIVE_NODE]) && !self.isBlock(block)) {
        continue;
      }
      button.disabled = !block;
    };
    var block = this.getBlock(button);
    if (block) {
      this.addEventListener(block.parentNode, "BlocksModified", setDisabled, false);
    }
    setDisabled();
  },

  onclick: function(button, event) {
    event.preventDefault(); // prevent submit
    var block = this.getBlock(button);
    if (block) {
      this.moveRepetitionBlock(block, this.DIRECTION);
    }
  }
});
