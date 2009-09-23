
base2.dom.bind(document);

new base2.JSB.Rule("pre", {
  oncontentready: function(element) {
    var names = element.className.split(/\s+/);
    for (var i = 0; i < names.length; i++) {
      // use the first class name that matches a highlighter
      var engine = names[i];
      var colorizer = Colorizer[engine];
      if (colorizer instanceof Colorizer) {
        var textContent = base2.dom.Traversal.getTextContent(element);
        element.innerHTML = colorizer.exec(textContent);
        element.classList.add("highlight");
        if (engine == "html-multi") element.classList.add("html");
        break;
      }
    }
  }
});
