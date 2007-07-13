
// If the browser supports XPath then the CSS selector is converted to an XPath query instead.

Selector.implement({
	toXPath: function() {
		return Selector.toXPath(this);
	},
	
	"@(XPathResult)": {
		$evaluate: function(context, single) {
			// use DOM methods if the XPath engine can't be used
			if (Selector.$NOT_XPATH.test(this)) {
				return base(this, arguments);
			}
			var document = Traversal.getDocument(context);
			var type = single
				? 9 /* FIRST_ORDERED_NODE_TYPE */
				: 7 /* ORDERED_NODE_SNAPSHOT_TYPE */;
			var result = document.evaluate(this.toXPath(), context, null, type, null);
			return single ? result.singleNodeValue : result;
		}
	},
	
	"@MSIE": {
		$evaluate: function(context, single) {
			if (typeof context.selectNodes != "undefined" && !Selector.$NOT_XPATH.test(this)) { // xml
				var method = single ? "selectSingleNode" : "selectNodes";
				return context[method](this.toXPath());
			}
			return base(this, arguments);
		}
	}
});

extend(Selector, {	
	xpathParser: null,
	
	toXPath: function(selector) {
		if (!this.xpathParser) this.xpathParser = new XPathParser;
		return this.xpathParser.parse(selector);
	},
	
	$NOT_XPATH: /:(checked|disabled|enabled|contains)|^(#[\w-]+\s*)?\w+$/,
	
	"@KHTML": { // XPath is just too buggy on earlier versions of Safari
		"@!WebKit5": {
			$NOT_XPATH: /./
		}
	}
});
