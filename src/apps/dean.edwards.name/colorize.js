
bindings.add("pre", {
  ondocumentready: function() {
    if (this.classList.has("js")) {
      this.classList.add("javascript");
    }
    var names = this.className.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      // use the first class name that matches a highlighter
      var engine = names[i];
      var colorizer = Colorizer[engine];
      if (colorizer instanceof Colorizer) {
        var textContent = Traversal.getTextContent(this);
        this.innerHTML = colorizer.exec(textContent);
        this.classList.add("highlight");
        if (engine == "html-multi") this.classList.add("html");
        break;
      }
    }
  }
});
