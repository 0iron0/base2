
var add = button.extend({
  onattach: function(button) {
    if (this.hasAttribute(button, "template")) {
      var template = this.getTemplate(button);
    } else {
      var block = button;
      while (block && !this.isBlock(block)) {
        block = block.parentNode;
      }
      if (block) {
        template = this.getRepetitionTemplate(block);
      }
    }
    button.disabled = !template;
  },

  onclick: function(button, event) {
    event.preventDefault(); // preent submit

    if (this.hasAttribute(button, "template")) {
      var template = this.getTemplate(button);
      var block = null;
    } else {
      block = button;
      while (block && !this.isBlock(block)) {
        block = block.parentNode;
      }
      if (block) {
        template = this.getRepetitionTemplate(block);
      }
    }
    if (template) {
      this.addRepetitionBlock(template, block);
    }
  },
  
  getTemplate: function(button) {
    var templateId = this.get(button, "template"),
        template = document.getElementById(templateId);

    if (template && this.isTemplate(template)) {
      return template;
    }
    
    return null;
  }
});
