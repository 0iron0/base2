
var remove = button.extend({
  onattach: function(button) {
    button.disabled = !this.getBlock(button);
    console2.log("REMOVE: " + button.innerHTML + "=" + button.disabled);
  },

  onclick: function(button, event) {
    event.preventDefault(); // prevent submit
    
    var block = this.getBlock(button);
    if (block) {
      this.removeRepetitionBlock(block);
    }
  }
});
