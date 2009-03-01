
var template = element.extend({
  onattach: function(template) {
    template.style.display = "none";
    
    var min   = this.get(template, "repeat-min");
        start = this.get(template, "repeat-start"),
        i = 0;
        
    while (i++ < start) {
      this.addRepetitionBlock(template, null);
    };
    
    i = this.getRepetitionBlocks(template).length;
    while (i++ < min) {
      this.addRepetitionBlock(template, null);
    }
  },

  onadded: _dispatchBlocksModifiedEvent,
  onmoved: _dispatchBlocksModifiedEvent,
  onremoved: _dispatchBlocksModifiedEvent
});
