
// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Interface.extend({
	"@!(document.defaultView.getComputedStyle)": {
		getComputedStyle: function(view, element, pseudoElement) {
			// pseudoElement parameter is not supported
			return element.currentStyle; //-dean - fix this object too
		}
	}
}, {
	toCamelCase: function(string) {
		return String(string).replace(/\-([a-z])/g, function(match, chr) {
			return chr.toUpperCase();
		});
	}
});
