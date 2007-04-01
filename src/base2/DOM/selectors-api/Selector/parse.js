
// CSS parser - converts CSS selectors to DOM queries.

// Hideous code but it produces fast DOM queries.
// Respect due to Alex Russell and Jack Slocum for inspiration.

// TO DO:
// * sort nodes into document order (comma separated queries only)

new function() {	
	// some constants
	var MSIE = BOM.detect("MSIE");
	var MSIE5 = BOM.detect("MSIE5");
	var INDEXED = BOM.detect("(element.sourceIndex)") ;
	var VAR = "var p%2=0,i%2,e%2,n%2=e%1.";
	var ID = INDEXED ? "e%1.sourceIndex" : "assignID(e%1)";
	var TEST = "var g=" + ID + ";if(!p[g]){p[g]=1;";
	var STORE = "r[r.length]=e%1;if(s)return e%1;";
	var FN = "fn=function(e0,s){indexed={};var r=[],p={},reg=[%1]," +
		"d=Traversal.getDocument(e0),c=d.body?'toUpperCase':'toString';";
	
	// IE confuses the name attribute with id for form elements,
	// use document.all to retrieve all elements with name/id instead
	var getElementById = MSIE ? function(document, id) {
		var result = document.all[id] || null;
		// returns a single element or a collection
		if (!result || result.id == id) return result;
		// document.all has returned a collection of elements with name/id
		for (var i = 0; i < result.length; i++) {
			if (result[i].id == id) return result[i];
		}
		return null;
	} : function(document, id) {
		return document.getElementById(id);
	};
	
	// register a node and index its children
	//  store the indexes in a hash, it is faster to augment the element itself but
	//  that just seems dirty
	var indexed = {};
	function register(element) {
		var uid = INDEXED ? element.sourceIndex : assignID(element);
		if (!indexed[uid]) {
			var elements = indexed[uid] = {};
			var children = MSIE ? element.children || element.childNodes : element.childNodes;
			var index = 0;
			var child;
			for (var i = 0; (child = children[i]); i++) {
				if (Traversal.isElement(child)) {
					elements[INDEXED ? child.sourceIndex : assignID(child)] = ++index;
				}
			}
			elements.length = index;
		}
		return uid;
	};
	
	// variables used by the parser
	var fn;
	var index; 
	var reg; // a store for RexExp objects
	var wild; // need to flag certain wild card selectors as MSIE includes comment nodes
	var list; // are we processing a node list?
	var dup; // possible duplicates?
	var cache = {}; // store parsed selectors
	
	// a hideous parser
	var parser = new Parser({
		"^ \\*:root": function(match) {
			wild = false;
			var replacement = "e%2=d.documentElement;if(Traversal.contains(e%1,e%2)){";
			return format(replacement, index++, index);
		},
		" (\\*|[\\w-]+)#([\\w-]+)": function(match, tagName, id) {
			wild = false;
			var replacement = "var e%2=getElementById(d,'%4');if(";
			if (tagName != "*") replacement += "e%2.nodeName=='%3'[c]()&&";
			replacement += "Traversal.contains(e%1,e%2)){";
			if (list) replacement += format("i%1=n%1.length;", list);
			return format(replacement, index++, index, tagName, id);
		},
		" (\\*|[\\w-]+)": function(match, tagName) {
			dup++; // this selector may produce duplicates
			wild = tagName == "*";
			var replacement = VAR;
			// IE5.x does not support getElementsByTagName("*");
			replacement += (wild && MSIE5) ? "all" : "getElementsByTagName('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			return format(replacement, index++, list = index, tagName);
		},
		">(\\*|[\\w-]+)": function(match, tagName) {
			var children = MSIE && list;
			wild = tagName == "*";
			var replacement = VAR;
			// use the children property for MSIE as it does not contain text nodes
			//  (but the children collection still includes comments).
			// the document object does not have a children collection
			replacement += children ? "children": "childNodes";
			if (!wild && children) replacement += ".tags('%3')";
			replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
			if (wild) {
				replacement += "if(e%2.nodeType==1){";
				wild = MSIE5;
			} else {
				if (!children) replacement += "if(e%2.nodeName=='%3'[c]()){";
			}
			return format(replacement, index++, list = index, tagName);
		},
		"([+~])(\\*|[\\w-]+)": function(match, combinator, tagName) {
			var replacement = "";
			if (wild && MSIE) replacement += "if(e%1.tagName!='!'){";
			wild = false;
			var direct = combinator == "+";
			if (!direct) {
				replacement += "while(";		
				dup = 2; // this selector may produce duplicates
			}
			replacement += "e%1=Traversal.getNextElementSibling(e%1)";
			replacement += (direct ? ";" : "){") + "if(e%1";
			if (tagName != "*") replacement += "&&e%1.nodeName=='%2'[c]()";
			replacement += "){";
			return format(replacement, index, tagName);
		},
		"#([\\w-]+)": function(match, id) {
			wild = false;
			var replacement = "if(e%1.id=='%2'){";		
			if (list) replacement += format("i%1=n%1.length;", list);
			return format(replacement, index, id);
		},
		"\\.([\\w-]+)": function(match, className) {
			wild = false;
			// store RegExp objects - slightly faster on IE
			reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
			return format("if(reg[%2].test(e%1.className)){", index, reg.length - 1);
		},
		":not\\((\\*|[\\w-]+)?([^)]*)\\)": function(match, tagName, filters) {
			var replacement = (tagName && tagName != "*") ? format("if(e%1.nodeName=='%2'[c]()){", index, tagName) : "";
			replacement += parser.exec(filters);
			return "if(!" + replacement.slice(2, -1).replace(/\)\{if\(/g, "&&") + "){";
		},
		":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) {
			wild = false;
			last = format("indexed[p%1].length", index);
			var replacement = "if(p%1!==e%1.parentNode.";
			replacement += INDEXED ? "sourceIndex" : "base2ID";
			replacement += ")p%1=register(e%1.parentNode);var i=indexed[p%1][" + ID + "];if(";
			return format(replacement, index) + Parser._nthChild(match, args, "i", last, "!", "&&", "%", "==") + "){";
		},
		":([\\w-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) {
			return "if(" + format(Selector.pseudoClasses[pseudoClass], index, args || "") + "){";
		},
		"\\[([\\w-]+)\\s*([^=]?=)?\\s*([^\\]]*)\\]": function(match, attr, operator, value) {
			if (operator) {
				if (attr == "class") attr == "className";
				else if (attr == "for") attr == "htmlFor";
				attr = format("(e%1.getAttribute('%2')||e%1['%2'])", index, attr);
			} else {
				attr = format("Element.getAttribute(e%1,'%2')", index, attr);
			} 
			var replacement = Selector.operators[operator || ""];
			if (instanceOf(replacement, RegExp)) {
				reg.push(new RegExp(format(replacement.source, rescape(parser.unescape(value)))));
				replacement = "reg[%2].test(%1)";
				value = reg.length - 1;
			}
			return "if(" + format(replacement, attr, value) + "){";
		}
	});
	
	// return the parse() function
	Selector.parse = function(selector) {
		if (!cache[selector]) {
			reg = []; // store for RegExp objects
			fn = "";
			var selectors = parser.escape(selector).split(",");			
			forEach(selectors, function(selector, label) {
				index = list = dup = 0; // reset
				var block = parser.exec(selector);
				if (wild && MSIE) { // IE's pesky comment nodes
					block += format("if(e%1.tagName!='!'){", index);
				}
				var store = (label || dup > 1) ? TEST : "";
				block += format(store + STORE, index);
				var braces = match(block, /\{/g).length;
				while (braces--) block += "}";
				fn += block;
			});
			eval(format(FN, reg) + parser.unescape(fn) + "return r}");
			cache[selector] = fn;
		}
		return cache[selector];
	};
};
