
Colorizer["html-multi"] = Colorizer.html.union({
	inline: function(match, tagName, attributes, cdata) {
		// highlight text contained between <script> and <style> tags
		var engine = tagName == "style" ? "css" : "javascript";
		cdata = Colorizer[engine].exec(cdata, true);
		cdata = format('<span class="%1">%2</span>', engine, cdata);
		return Colorizer.html.processCDATA(tagName, attributes, cdata);
	}
});
