
// XPath parser
// converts CSS expressions to *optimised* XPath queries

// This code used to be quite readable until I added code to optimise *-child selectors. 

var XPathParser = Parser.extend({
	constructor: function() {
		this.base(XPathParser.rules);
		// The sorter sorts child selectors to the end because they are slow.
		// For XPath we need the child selectors to be sorted to the beginning,
		// so we reverse the sort order. That's what this line does:
		this.sorter.storeAt(1, "$1$4$3$6");
	},
	
	escape: function(selector) {
		return this.base(selector).replace(/,/g, "\x02");
	},
	
	unescape: function(selector) {
		return this.base(selector
			.replace(/\[self::\*\]/g, "") // remove redundant wild cards
			.replace(/\x02/g, " | ")
		);
	},
	
	"@opera": {
		unescape: function(selector) {
			// opera does not seem to support last() but I can't find any 
			//  documentation to confirm this
			return this.base(selector.replace(/last\(\)/g, "count(preceding-sibling::*)+count(following-sibling::*)+1"));
		}
	}
}, {
	init: function() {
		// build the prototype
		this.values.attributes[""] = "[@$1]";
		forEach (this.types, function(add, type) {
			forEach (this.values[type], add, this.rules);
		}, this);
	},
	
	optimised: {		
		pseudoClasses: {
			"first-child": "[1]",
			"last-child":  "[last()]",
			"only-child":  "[last()=1]"
		}
	},
	
	rules: extend({}, {
		"@!KHTML": { // these optimisations do not work on Safari
			// fast id() search
			"(^|\\x02) (\\*|[\\w-]+)#([\\w-]+)": "$1id('$3')[self::$2]",
			// optimise positional searches
			"([ >])(\\*|[\\w-]+):([\\w-]+-child(\\(([^)]+)\\))?)": function(match, token, tagName, pseudoClass, $4, args) {
				var replacement = (token == " ") ? "//*" : "/*";
				if (/^nth/i.test(pseudoClass)) {
					replacement += _nthChild(pseudoClass, args, "position()");
				} else {
					replacement += XPathParser.optimised.pseudoClasses[pseudoClass];
				}
				return replacement + "[self::" + tagName + "]";
			}
		}
	}),
	
	types: {
		identifiers: function(replacement, token) {
			this[rescape(token) + "([\\w-]+)"] = replacement;
		},
		
		combinators: function(replacement, combinator) {
			this[rescape(combinator) + "(\\*|[\\w-]+)"] = replacement;
		},
		
		attributes: function(replacement, operator) {
			this["\\[([\\w-]+)\\s*" + rescape(operator) +  "\\s*([^\\]]*)\\]"] = replacement;
		},
		
		pseudoClasses: function(replacement, pseudoClass) {
			this[":" + pseudoClass.replace(/\(\)$/, "\\(([^)]+)\\)")] = replacement;
		}
	},
	
	values: {
		identifiers: {
			"#": "[@id='$1'][1]", // ID selector
			".": "[contains(concat(' ',@class,' '),' $1 ')]" // class selector
		},
		
		combinators: {
			" ": "/descendant::$1", // descendant selector
			">": "/child::$1", // child selector
			"+": "/following-sibling::*[1][self::$1]", // direct adjacent selector
			"~": "/following-sibling::$1" // indirect adjacent selector
		},
		
		attributes: { // attribute selectors
			"*=": "[contains(@$1,'$2')]",
			"^=": "[starts-with(@$1,'$2')]",
			"$=": "[substring(@$1,string-length(@$1)-string-length('$2')+1)='$2']",
			"~=": "[contains(concat(' ',@$1,' '),' $2 ')]",
			"|=": "[contains(concat('-',@$1,'-'),'-$2-')]",
			"!=": "[not(@$1='$2')]",
			"=":  "[@$1='$2']"
		},
		
		pseudoClasses: { // pseudo class selectors
			"empty":            "[not(child::*) and not(text())]",
//			"lang()":           "[boolean(lang('$1') or boolean(ancestor-or-self::*[@lang][1][starts-with(@lang,'$1')]))]",
			"first-child":      "[not(preceding-sibling::*)]",
			"last-child":       "[not(following-sibling::*)]",
			"not()":            _not,
			"nth-child()":      _nthChild,
			"nth-last-child()": _nthChild,
			"only-child":       "[not(preceding-sibling::*) and not(following-sibling::*)]",
			"root":             "[not(parent::*)]"
		}
	},
	
	"@opera": {	
		init: function() {
			this.optimised.pseudoClasses["last-child"] = this.values.pseudoClasses["last-child"];
			this.optimised.pseudoClasses["only-child"] = this.values.pseudoClasses["only-child"];
			this.base();
		}
	}
});

// these functions defined here to make the code more readable

function _not(match, args) {
	var parser = new XPathParser;
	return "[not(" + parser.exec(trim(args))
		.replace(/\[1\]/g, "") // remove the "[1]" introduced by ID selectors
		.replace(/^(\*|[\w-]+)/, "[self::$1]") // tagName test
		.replace(/\]\[/g, " and ") // merge predicates
		.slice(1, -1)
	+ ")]";
};

function _nthChild(match, args, position) {
	return "[" + Parser._nthChild(match, args, position || "count(preceding-sibling::*)+1", "last()", "not", " and ", " mod ", "=") + "]";
};
