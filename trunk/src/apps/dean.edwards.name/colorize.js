
Colorizer.javascript.store(/("@[^\"]+"):/, '<span class="special">$1</span>:');
Colorizer.javascript.store("\\b(assignID|base|base2|base2ID|detect|every|extend|filter|forEach|" +
	"format|implement|instanceOf|invoke|K|map|pluck|reduce|rescape|slice|some|trim)\\b",
		'<span class="base2">$0</span>');

bindings.add("pre", {
	ondocumentready: function() {
		if (this.hasClass("js")) {
			this.addClass("javascript");
		}
		var names = this.className.split(/\s+/);
		for (var i = 0; i < names.length; i++) {
			// use the first class name that matches a highlighter
			var engine = names[i];
			var colorizer = Colorizer[engine];
			if (instanceOf(colorizer, Colorizer)) {
				var textContent = Traversal.getTextContent(this);
				this.setAttribute("originalText", textContent);
				this.innerHTML = colorizer.exec(textContent);
				this.addClass("highlight");
				if (engine == "html-multi") this.addClass("html");
				break;
			}
		}
	}
});
