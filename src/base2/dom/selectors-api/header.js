
var _USE_BASE2 = detect("(input.getAttribute('type')=='text')") ? /:visited|\[(type|value)|\b(object|param)\b/i : /:visited/; // security

var _SORTER = detect("(element.compareDocumentPosition)") ? function(a, b) {
  return (a.compareDocumentPosition(b) & 2) - 1;
} : document.createRange ? function(a, b) { // Stolen shamelessly from jQuery. I'm allowed. ;)
		var document = a.ownerDocument,
        aRange = document.createRange(),
        bRange = document.createRange();
		aRange.selectNode(a);
		aRange.collapse(true);
		bRange.selectNode(b);
		bRange.collapse(true);
		return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
} : function(a, b) {
  return (Node.compareDocumentPosition(a, b) & 2) - 1;
};

var _CSS_ESCAPE =           /'(\\.|[^'\\])*'|"(\\.|[^"\\])*"|\\./g,
    _CSS_IMPLIED_ASTERISK = /([\s>+~,]|[^(]\+|^)([#.:\[])/g,
    _CSS_IMPLIED_SPACE =    /(^|,)([^\s>+~])/g,
    _CSS_TRIM =             /\s*([\^*~|$]?=|[\s>+~,]|^|$)\s*/g,
    _CSS_LTRIM =            /\s*([\])])/g,
    _CSS_RTRIM =            /([\[(])\s*/g,
    _CSS_UNESCAPE =         /\x01(\d+)\x01/g,
    _CSS_CONTEXT =          /^ \*?/g,
    _QUOTE =                /'/g;
    
var _SPECIFICITY_ID =    /#/g,
    _SPECIFICITY_CLASS = /[.:\[]/g,
    _SPECIFICITY_TAG =   /^\w|[\s>+~]\w/g;

var _COMBINATOR = /^[\s>+~]$/;

var _NOT_XML   = ":(checked|disabled|enabled|selected|hover|active|focus|link|visited|target)",
    _NOT_XPATH = _NOT_XML + "|^(#[\\w\u00a1-\uffff\\-]+\\s*)?[\\w\u00a1-\uffff\\-]+$";
if (detect("KHTML")) {
  if (detect("WebKit5")) {
    _NOT_XPATH += "|nth\\-|,";
  } else {
    _NOT_XPATH = ".";
  }
}
_NOT_XML   = new RegExp(_NOT_XML);
_NOT_XPATH = new RegExp(_NOT_XPATH);

var _matchesSelector = function(test, context) {
  if (typeof test != "function") {
    test = new Selector(test).toDOMQuery(true);
  }
  return this.base(test, context);
};

function _nthChild(match, args, position, last, not, and, mod, equals) {
  // Ugly but it works for both CSS and XPath
  last = /last/i.test(match) ? last + "+1-" : "";
  if (!isNaN(args)) args = "0n+" + args;
  else if (args == "even") args = "2n";
  else if (args == "odd") args = "2n+1";
  args = args.split("n");
  var a = args[0] ? (args[0] == "-") ? -1 : parseInt(args[0], 10) : 1;
  var b = parseInt(args[1], 10) || 0;
  var negate = a < 0;
  if (negate) {
    a = -a;
    if (a == 1) b++;
  }
  var query = format(a == 0 ? "%3%7" + (last + b) : "(%4%3-(%2))%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
  if (negate) query = not + "(" + query + ")";
  return query;
};

var _xpathParser, _notParser;

function _xpath_not(match, args) {
  if (!_notParser) _notParser = new XPathParser;
  return "[not(" + _notParser.exec(trim(args))
    .replace(/\[1\]/g, "") // remove the "[1]" introduced by ID selectors
    .replace(/^(\*|[\w\u00a1-\uffff\-\x01]+)/, "[self::$1]") // tagName test
    .replace(/\]\[/g, " and ") // merge predicates
    .slice(1, -1)
  + ")]";
};

function _xpath_nthChild(match, args, position) {
  return "[" + _nthChild(match, args, position || "count(preceding-sibling::*)+1", "last()", "not", " and ", " mod ", "=") + "]";
};

// IE confuses the name attribute with id for some elements.
// Use document.all to retrieve elements with name/id instead.
var id = "base2" + Date2.now(),
    root = document.documentElement;
_element.innerHTML = '<a name="' + id + '"></a>';
root.insertBefore(_element, root.firstChild);

var _byId = document.getElementById(id) == _element.firstChild ? document.all ? function(document, id) {
  var result = document.all[id] || null;
  // Returns a single element or a collection.
  if (!result || (result.nodeType && Element.getAttribute(result, "id") == id)) return result;
  // document.all has returned a collection of elements with name/id
  for (var i = 0; i < result.length; i++) {
    if (Element.getAttribute(result[i], "id") == id) return result[i];
  }
  return null;
} : null : function(document, id) {
  return document.getElementById(id);
};

root.removeChild(_element);
// Register a node and index its children.
var _indexed = 1,
    _indexes = {};
function _register(element) {
  if (_indexes._indexed != _indexed) {
    _indexes = {_indexed: _indexed};
  }
  var isIndexed = element.sourceIndex > 0,
      id = isIndexed ? element.sourceIndex : element.uniqueID || assignID(element);
  if (!_indexes[id]) {
    var indexes = {},
        index = 1,
        child = element.firstChild;
    while (child) {
      if (child.nodeType == 1)
        /*@if (@_jscript_version < 5.6)
          if (child.nodeName != "!")
        /*@end @*/
        indexes[isIndexed ? child.sourceIndex : child.uniqueID || assignID(child)] = index++;
      child = child.nextSibling;
    }
    indexes.length = index;
    _indexes[id] = indexes;
  }
  return _indexes[id];
};

function _catchSelectorError(selector, node, count) {
  try {
    var result = selector.base(node, count);
  } catch (x) {
    if (Traversal.isDocument(node) || Traversal.isElement(node) || node.nodeType == 11) {
      if (Traversal.isXML(node) && _NOT_XML.test(selector)) {
        result = null;
      } else { // Probably an invalid selector =)
        var error = new SyntaxError(format("'%1' is not a valid CSS selector.", selector));
        error.code = 12; // DOMException.SYNTAX_ERR
        throw error;
      }
    } else {
      throw new TypeError("Invalid argument.");
    }
  }
  return result;
};
