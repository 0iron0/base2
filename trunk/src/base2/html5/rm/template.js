
var template = element.extend({
  onattach: function(template) {
    template.style.display = "none";
    if (template.parentNode && template.parentNode.nodeType == 1) {
      // maintain the mimimum number of blocks
      var i = 0;
      var start = this.get(template, "repeat-start");
      while (i++ < start) {
        this.addRepetitionBlock(template, null);
      };
      i = this.getRepetitionBlocks(template).length;
      while (i++ < this.repeatMin) {
        this.addRepetitionBlock(template, null);
      }
    }
  },

  onadded: _dispatchBlocksModifiedEvent,
  onmoved: _dispatchBlocksModifiedEvent,
  onremoved: _dispatchBlocksModifiedEvent
});
