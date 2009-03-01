
var add = button.extend({
  onattach: function(button) {
    if (this.hasAttribute(button, "template")) {
      var template = this.getHtmlTemplate(button);
    } else {
      var block = this.getBlock(button);
      if (block) {
        template = this.getRepetitionTemplate(block);
      }
    }
    if (template) {
      html5.template.attach(template);
    }
    button.disabled = !template;
  },

  onclick: function(button, event) {
    event.preventDefault(); // prevent submit

    if (this.hasAttribute(button, "template")) {
      var template = this.getHtmlTemplate(button);
      var block = null;
    } else {
      block = this.getBlock(button);
      if (block) {
        template = this.getRepetitionTemplate(block);
      }
    }
    if (template) {
      this.addRepetitionBlock(template, block);
    }
  },
  
  getHtmlTemplate: function(button) {
    var template = document.getElementById(this.get(button, "template"));

    if (this.isTemplate(template)) {
      return template;
    }
    
    return null;
  }
});
