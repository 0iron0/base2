
// This object can be instantiated, however it is probably better to use
// the querySelector/querySelectorAll methods on DOM nodes.

// There is no public standard for this object.

var _NOT_XPATH = ":(checked|disabled|enabled|contains)|^(#[\\w-]+\\s*)?\\w+$";
if (detect("KHTML")) {
  if (detect("WebKit5")) {
    _NOT_XPATH += "|nth\\-|,";
  } else {
    _NOT_XPATH = ".";
  }
}
_NOT_XPATH = new RegExp(_NOT_XPATH);

var _xpathParser;

var Selector = Base.extend({
  constructor: function(selector) {
    this.toString = K(trim(selector));
  },
  
  exec: function(context, single) {
    return Selector.parse(this)(context, single);
  },
  
  test: function(element) {
    //-dean: improve this for simple selectors
    var selector = new Selector(this + "[b2-test]");
    element.setAttribute("b2-test", true);
    var result = selector.exec(Traversal.getOwnerDocument(element), true);
    element.removeAttribute("b2-test");
    return result == element;
  },
  
  toXPath: function() {
    return Selector.toXPath(this);
  },
  
  "@(XPathResult)": {
    exec: function(context, single) {
      // use DOM methods if the XPath engine can't be used
      if (_NOT_XPATH.test(this)) {
        return this.base(context, single);
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
    exec: function(context, single) {
      if (typeof context.selectNodes != "undefined" && !_NOT_XPATH.test(this)) { // xml
        var method = single ? "selectSingleNode" : "selectNodes";
        return context[method](this.toXPath());
      }
      return this.base(context, single);
    }
  },
  
  "@(true)": {
    exec: function(context, single) {
      try {
        var result = this.base(context || document, single);
      } catch (error) { // probably an invalid selector =)
        throw new SyntaxError(format("'%1' is not a valid CSS selector.", this));
      }
      return single ? result : new StaticNodeList(result);
    }
  }
}, {  
  toXPath: function(selector) {
    if (!_xpathParser) _xpathParser = new XPathParser;
    return _xpathParser.parse(selector);
  }
});

// Selector.parse() - converts CSS selectors to DOM queries.

// Hideous code but it produces fast DOM queries.
// Respect due to Alex Russell and Jack Slocum for inspiration.

new function(_) {
  // some constants
  var _OPERATORS = {
    "=":  "%1=='%2'",
    "!=": "%1!='%2'", //  not standard but other libraries support it
    "~=": /(^| )%1( |$)/,
    "|=": /^%1(-|$)/,
    "^=": /^%1/,
    "$=": /%1$/,
    "*=": /%1/
  };
  _OPERATORS[""] = "%1!=null";    
  var _PSEUDO_CLASSES = { //-dean: lang()
    "checked":     "e%1.checked",
    "contains":    "e%1[TEXT].indexOf('%2')!=-1",
    "disabled":    "e%1.disabled",
    "empty":       "Traversal.isEmpty(e%1)",
    "enabled":     "e%1.disabled===false",
    "first-child": "!Traversal.getPreviousElementSibling(e%1)",
    "last-child":  "!Traversal.getNextElementSibling(e%1)",
    "only-child":  "!Traversal.getPreviousElementSibling(e%1)&&!Traversal.getNextElementSibling(e%1)",
    "root":        "e%1==Traversal.getDocument(e%1).documentElement"
  };
  var _INDEXED = detect("(element.sourceIndex)") ;
  var _VAR = "var p%2=0,i%2,e%2,n%2=e%1.";
  var _ID = _INDEXED ? "e%1.sourceIndex" : "assignID(e%1)";
  var _TEST = "var g=" + _ID + ";if(!p[g]){p[g]=1;";
  var _STORE = "r[r.length]=e%1;if(s)return e%1;";
//var _SORT = "r.sort(sorter);";
  var _FN = "fn=function(e0,s){indexed++;var r=[],p={},reg=[%1]," +
    "d=Traversal.getDocument(e0),c=d.body?'toUpperCase':'toString';";

  // IE confuses the name attribute with id for form elements,
  // use document.all to retrieve all elements with name/id instead
  var byId = _MSIE ? function(document, id) {
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
  var indexed = 1;
  function register(element) {
    if (element.rows) {
      element.b2_length = element.rows.length;
      element.b2_lookup = "rowIndex";
    } else if (element.cells) {
      element.b2_length = element.cells.length;
      element.b2_lookup = "cellIndex";
    } else if (element.b2_indexed != indexed) {
      var index = 0;
      var child = element.firstChild;
      while (child) {
        if (child.nodeType == 1 && child.nodeName != "!") {
          child.b2_index = ++index;
        }
        child = child.nextSibling;
      }
      element.b2_length = index;
      element.b2_lookup = "b2_index";
    }
    element.b2_indexed = indexed;
    return element;
  };

//var sorter = _INDEXED ? function(a, b) {
//  return a.sourceIndex - b.sourceIndex;
//} : Node.compareDocumentPosition;

  // variables used by the parser
  var fn;
  var reg; // a store for RexExp objects
  var _index;
  var _wild; // need to flag certain _wild card selectors as _MSIE includes comment nodes
  var _list; // are we processing a node _list?
  var _duplicate; // possible duplicates?
  var _cache = {}; // store parsed selectors

  // a hideous parser
  var parser = new CSSParser({
    "^ \\*:root": function(match) { // :root pseudo class
      _wild = false;
      var replacement = "e%2=d.documentElement;if(Traversal.contains(e%1,e%2)){";
      return format(replacement, _index++, _index);
    },
    " (\\*|[\\w-]+)#([\\w-]+)": function(match, tagName, id) { // descendant selector followed by ID
      _wild = false;
      var replacement = "var e%2=byId(d,'%4');if(e%2&&";
      if (tagName != "*") replacement += "e%2.nodeName=='%3'[c]()&&";
      replacement += "Traversal.contains(e%1,e%2)){";
      if (_list) replacement += format("i%1=n%1.length;", _list);
      return format(replacement, _index++, _index, tagName, id);
    },
    " (\\*|[\\w-]+)": function(match, tagName) { // descendant selector
      _duplicate++; // this selector may produce duplicates
      _wild = tagName == "*";
      var replacement = _VAR;
      // IE5.x does not support getElementsByTagName("*");
      replacement += (_wild && _MSIE5) ? "all" : "getElementsByTagName('%3')";
      replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
      return format(replacement, _index++, _list = _index, tagName);
    },
    ">(\\*|[\\w-]+)": function(match, tagName) { // child selector
      var children = _MSIE && _list;
      _wild = tagName == "*";
      var replacement = _VAR;
      // use the children property for _MSIE as it does not contain text nodes
      //  (but the children collection still includes comments).
      // the document object does not have a children collection
      replacement += children ? "children": "childNodes";
      if (!_wild && children) replacement += ".tags('%3')";
      replacement += ";for(i%2=0;(e%2=n%2[i%2]);i%2++){";
      if (_wild) {
        replacement += "if(e%2.nodeType==1){";
        _wild = _MSIE5;
      } else {
        if (!children) replacement += "if(e%2.nodeName=='%3'[c]()){";
      }
      return format(replacement, _index++, _list = _index, tagName);
    },
    "\\+(\\*|[\\w-]+)": function(match, tagName) { // direct adjacent selector
      var replacement = "";
      if (_wild && _MSIE) replacement += "if(e%1.tagName!='!'){";
      _wild = false;
      replacement += "e%1=Traversal.getNextElementSibling(e%1);if(e%1";
      if (tagName != "*") replacement += "&&e%1.nodeName=='%2'[c]()";
      replacement += "){";
      return format(replacement, _index, tagName);
    },
    "~(\\*|[\\w-]+)": function(match, tagName) { // indirect adjacent selector
      var replacement = "";
      if (_wild && _MSIE) replacement += "if(e%1.tagName!='!'){";
      _wild = false;
      _duplicate = 2; // this selector may produce duplicates
      replacement += "while(e%1=e%1.nextSibling){if(e%1.b2_adjacent==indexed)break;if(";
      if (tagName == "*") {
        replacement += "e%1.nodeType==1";
        if (_MSIE5) replacement += "&&e%1.tagName!='!'";
      } else replacement += "e%1.nodeName=='%2'[c]()";
      replacement += "){e%1.b2_adjacent=indexed;";
      return format(replacement, _index, tagName);
    },
    "#([\\w-]+)": function(match, id) { // ID selector
      _wild = false;
      var replacement = "if(e%1.id=='%2'){";
      if (_list) replacement += format("i%1=n%1.length;", _list);
      return format(replacement, _index, id);
    },
    "\\.([\\w-]+)": function(match, className) { // class selector
      _wild = false;
      // store RegExp objects - slightly faster on IE
      reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
      return format("if(e%1.className&&reg[%2].test(e%1.className)){", _index, reg.length - 1);
    },
    ":not\\((\\*|[\\w-]+)?([^)]*)\\)": function(match, tagName, filters) { // :not pseudo class
      var replacement = (tagName && tagName != "*") ? format("if(e%1.nodeName=='%2'[c]()){", _index, tagName) : "";
      replacement += parser.exec(filters);
      return "if(!" + replacement.slice(2, -1).replace(/\)\{if\(/g, "&&") + "){";
    },
    ":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) { // :nth-child pseudo classes
      _wild = false;
      last = format("e%1.parentNode.b2_length", _index);
      var replacement = "if(p%1!==e%1.parentNode)p%1=register(e%1.parentNode);";
      replacement += "var i=e%1[p%1.b2_lookup];if(";
      return format(replacement, _index) + CSSParser._nthChild(match, args, "i", last, "!", "&&", "%", "==") + "){";
    },
    ":([\\w-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) { // other pseudo class selectors
      return "if(" + format(_PSEUDO_CLASSES[pseudoClass] || "throw", _index, args || "") + "){";
    },
    "\\[([\\w-]+)\\s*([^=]?=)?\\s*([^\\]]*)\\]": function(match, attr, operator, value) { // attribute selectors
      var alias = _ATTRIBUTES[attr] || attr;
      if (operator) {
        var getAttribute = "e%1.getAttribute('%2',2)";
        if (!_EVALUATED.test(attr)) {
          getAttribute = "e%1.%3||" + getAttribute;
        }
        attr = format("(" + getAttribute + ")", _index, attr, alias);
      } else {
        attr = format("Element.getAttribute(e%1,'%2')", _index, attr);
      }
      var replacement = _OPERATORS[operator || ""];
      if (instanceOf(replacement, RegExp)) {
        reg.push(new RegExp(format(replacement.source, rescape(parser.unescape(value)))));
        replacement = "reg[%2].test(%1)";
        value = reg.length - 1;
      }
      return "if(" + format(replacement, attr, value) + "){";
    }
  });
  
  Selector.parse = function(selector) {
    if (!_cache[selector]) {
      reg = []; // store for RegExp objects
      fn = "";
      var selectors = parser.escape(selector).split(",");
      for (var i = 0; i < selectors.length; i++) {
        _wild = _index = _list = 0; // reset
        _duplicate = selectors.length > 1 ? 2 : 0; // reset
        var block = parser.exec(selectors[i]) || "throw;";
        if (_wild && _MSIE) { // IE's pesky comment nodes
          block += format("if(e%1.tagName!='!'){", _index);
        }
        // check for duplicates before storing results
        var store = (_duplicate > 1) ? _TEST : "";
        block += format(store + _STORE, _index);
        // add closing braces
        block += Array(match(block, /\{/g).length + 1).join("}");
        fn += block;
      }
//    if (selectors.length > 1) fn += _SORT;
      eval(format(_FN, reg) + parser.unescape(fn) + "return s?null:r}");
      _cache[selector] = fn;
    }
    return _cache[selector];
  };
};
