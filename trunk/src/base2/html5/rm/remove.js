
var remove = button.extend({
  onattach: function(button) {
    var block = button;
    while (block && !this.isBlock(block)) {
      block = block.parentNode;
    }
    button.disabled = !block;
  },

  onclick: function(button, event) {
    event.preventDefault(); // preent submit
    
    var block = button;
    while (block && !this.isBlock(block)) {
      block = block.parentNode;
    }
    if (block) {
      this.removeRepetitionBlock(block);
    }
  }
});
