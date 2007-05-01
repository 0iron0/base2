
Colorizer.html = new Colorizer({
	conditional:   DEFAULT,
	doctype:       DEFAULT,
	inline:        function(match, tagName, attributes, cdata) {
		// ignore text contained between <script> and <style> tags
		return Colorizer.html.processCDATA(tagName, attributes, cdata);
	}
}, {
	conditional:   /<!(--)?\[[^\]]*\]>|<!\[endif\](--)?>/, // conditional comments
	doctype:       /<!DOCTYPE[^>]+>/,
	inline:        /<(script|style)([^>]*)>((\\.|[^\\])*)<\/\1>/
}, {
	tabStop:       1,
	CDATA:         '&lt;<span class="tag">%1</span>%2&gt;%3&lt;/<span class="tag">%1</span>&gt;',
	processCDATA:  function(tagName, attributes, cdata) {
		return format(this.CDATA, tagName, this.exec(attributes, true), cdata);
	}
});

Colorizer.html.merge(Colorizer.xml);
