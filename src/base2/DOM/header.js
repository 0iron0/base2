
/*@cc_on @*/

var _boundElementIDs = {};

var _element = document.createElement("span"),
    _style   = _element.style;

var _TEXT_CONTENT = detect("(element.textContent)") ? "textContent" : "innerText";

var _USE_IFLAG      = /^(action|cite|codebase|data|href|longdesc|lowsrc|src|usemap)$/i,
    _USE_OUTER_HTML = /^(type|value)$/i;

var _PARENT = detect("(element.parentElement)") ? "parentElement" : "parentNode";

var _MATCH_TYPE  = /type="?([^\s">]*)"?/i,
    _MATCH_VALUE = /value="?([^\s">]*)"?/i;

function _gecko_bind(node) {
  return extend(this.base(node), "removeEventListener", function() {
    var args = Array2.slice(arguments);
    args.unshift(this);
    EventTarget.removeEventListener.apply(EventTarget, args);
  });
};

var _getSourceIndex = _element.sourceIndex == undefined ? function(node) {
  // return a key suitable for comparing nodes
  var key = 0;
  while (node) {
    var index = Traversal.getNodeIndex(node);
    key = "0000".slice(0, 4 - String(index).length) + index + "." + key;
    node = node.parentNode;
  }
  return key;
} : function(node) {
  return node.sourceIndex;
};

var _ATTRIBUTES = {
  "class": "className",
  "for": "htmlFor"
};

// These mappings are for MSIE5.x
var _HTML_ATTRIBUTES =
  "accessKey,allowTransparency,cellPadding,cellSpacing,codeBase,codeType,colSpan,dateTime,"+
  "frameBorder,longDesc,maxLength,noHref,noResize,noShade,noWrap,readOnly,rowSpan,tabIndex,useMap,vAlign";
// Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
extend(_ATTRIBUTES, Array2.combine(_HTML_ATTRIBUTES.toLowerCase().split(","), _HTML_ATTRIBUTES.split(",")));

var _getAttributeNode = _element.getAttributeNode ? function(element, name) {
  return element.getAttributeNode(name);
} : function(element, name) {
  return element.attributes[name] || element.attributes[_ATTRIBUTES[name.toLowerCase()]];
};
