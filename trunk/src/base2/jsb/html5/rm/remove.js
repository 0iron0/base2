
var remove = button.extend({
  onattach: function(button) {
    button.disabled = !this.getBlock(button);
  },

  onclick: function(button, event) {
    event.preventDefault(); // prevent submit
    
    var block = this.getBlock(button);
    if (block) {
      this.removeRepetitionBlock(block);
    }
  }
});
