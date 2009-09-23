
var _IS_INDEXED              = detect("(element.sourceIndex)"),
    _SUPPORTS_CHILDREN       = detect("(element.children)"),
    _SUPPORTS_TRAVERSAL_API  = detect("(element.nextElementSibling)"),
    _ID                      = _IS_INDEXED ? "e.sourceIndex" : "e.uniqueID||assignID(e)",
    _ASSIGN_ID               = "u=" + _ID.replace(/\be\b/g, "e%1") + ";",
    _IS_ELEMENT              = "e.nodeType==1",
    _BREAK_ON_DUPLICATES     = "u=" + _ID + ";if(s[u])break;s[u]=1;",
    _PARSE_SIMPLE_SELECTOR   = new RegExp("^(\\*|[\\w\u00a1-\uffff\\-\\x01]+)?(.*)$"),
    _PARSE_ID_SELECTOR       = new RegExp("^#([\\w\u00a1-\uffff\\-\\x01]+)?(.*)$"),
    _TOKENIZER               = /[^\s>+]+(~=|n\+\d)[^\s>+]+|[^\s>+~]+|[\s>+~]/g,
    _VARIABLES               = /\b([aeEijnpstT])\b|('[^']+')/g;
    
/*@if (@_jscript_version < 5.6)
  _IS_ELEMENT += "&&e.nodeName!='!'";
/*@end @*/

// variables used by the parser

var _reg   = [],        // a store for RexExp objects
    _cache = {exec:{}, test:{}}; // store parsed selectors

var _combinators = {
  exec: extend({}, {
    " ": "var i,e,p,n=E.getElementsByTagName(T);for(i=a||0;e=n[i];i++){",
    ">": "var i,e,p,n=E." + (_SUPPORTS_CHILDREN ? "children" : "childNodes") + ";for(i=a||0;e=n[i];i++){",
    "+": "while((e=e.nextSibling)&&!(" + _IS_ELEMENT + "))continue;if(e){",
    "~": "while((e=e.nextSibling)){",
    "@(element.nextElementSibling)": {
      "+": "e=e.nextElementSibling;if(e){",
      "~": "while((e=e.nextElementSibling)){"
    }
  }),

  test: {
    " ": "var e=E;while((e=e." + _PARENT + ")){",
    ">": "var e=E." + _PARENT + ";if(e){"
  }
};

_combinators.test["+"] = _combinators.exec["+"].replace("next", "previous");
_combinators.test["~"] = _combinators.exec["~"].replace("next", "previous");

var _pseudoClasses = extend({}, {
  "checked":     "e.checked",
  "contains":    "e." + Traversal.TEXT_CONTENT + ".indexOf('%1')!=-1",
  "disabled":    "e.disabled===true",
  "empty":       "Traversal.isEmpty(e)",
  "enabled":     "e.disabled===false",
  "first-child": "!(e.previousSibling&&Traversal.getPreviousElementSibling(e))",
  "last-child":  "!(e.nextSibling&&Traversal.getNextElementSibling(e))",
  "@(element.nextElementSibling)": {
    "first-child": "!e.previousElementSibling",
    "last-child":  "!e.nextElementSibling"
  },
  "root":        "e==d.documentElement",
  "target":      "e.id&&Element.getAttribute(e,'id')==d.location.hash.slice(1)",
  "hover":       "DocumentState.getInstance(d).isHover(e)",
  "active":      "DocumentState.getInstance(d).isActive(e)",
  "focus":       "DocumentState.getInstance(d).hasFocus(e)",
  "link":        "d.links&&Array2.contains(d.links,e)",
  "visited":     "false" // not implemented (security)
// not:          // defined elsewhere
// nth-child:
//"only-child":
});

_pseudoClasses["only-child"] = _pseudoClasses["first-child"] + "&&" + _pseudoClasses["last-child"];

var _operators = {
  "=":  "%1=='%2'",
//"!=": "%1!='%2'", //  not standard but other libraries support it
  "~=": /(^| )%1( |$)/,
  "|=": /^%1(-|$)/,
  "^=": /^%1/,
  "$=": /%1$/,
  "*=": /%1/
};
_operators[""] = "%1";

var _parser = new CSSParser({
  ":not\\((\\*|[ID]+)?(([^\\s>+~]|~=)+)\\)": function(match, tagName, filters) { // :not pseudo class
    var replacement = (tagName && tagName != "*") ? "if(e.nodeName!='" + tagName + "'){" : "";
    replacement += _parser.exec(filters).replace(/if\(\(/g, "if(!(");
    return replacement;
  },

  "#([ID]+)": "if(((e.submit?Element.getAttribute(e,'id'):e.id)=='$1')){", // ID selector

  "\\.([ID]+)": function(match, className) { // class selector
    // Store RegExp objects - slightly faster on MSIE
    _reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
    return "if((e.className&&reg[" + (_reg.length - 1) + "].test(e.className))){";
  },

  ":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) { // :nth-child pseudo classes
    return "p=_register(e.parentNode);" + format(_ASSIGN_ID, "") +
      "var j=p[u];if((" + _nthChild(match, args, "j", "p.length", "!", "&&", "% ", "==") + ")){";
  },

  ":([a-z\\-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) { // other pseudo class selectors
    return "if((" + format(_pseudoClasses[pseudoClass] || "throw", args) + ")){";
  },

  "\\[([ID]+)([^=]?=)?([^\\]]*)\\]": function(match, attr, operator, value) { // attribute selectors
    value = trim(value);
    if (attr == "class") {
      var getAttribute = "e.className";
    } else {
      var method = (operator ? "get" : "has") + "Attribute";
      if (Element.prototype[method]) { // base2 does not trust the native method
        getAttribute = "Element." + method + "(e,'" + attr + "')";
      } else { // base2 thinks the native method is spiffing
        getAttribute = "e." + method + "('" + attr + "')";
      }
    }
    var replacement = _operators[operator || ""];
    if (instanceOf(replacement, RegExp)) {
      _reg.push(new RegExp(format(replacement.source, rescape(_parser.unescape(value)))));
      replacement = "reg[%2].test(%1)";
      value = _reg.length - 1;
    }
    return "if((" + format(replacement, getAttribute, value) + ")){";
  }
});
