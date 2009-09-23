
// Thanks to Diego Perini for help and inspiration.

var dom = new base2.Package(this, {
  name:    "dom",
  version:  base2.version,
  imports: "Function2",
  exports:
    "Interface,Binding,Node,Document,Element,Traversal,"+          // Core
    "AbstractView,"+                                               // Views
    "ViewCSS,CSSStyleDeclaration,"+                                // Style
    "NodeSelector,StaticNodeList,Selector,CSSParser,XPathParser,"+ // Selectors API
    "Event,EventTarget,DocumentEvent,"+                            // Events
    "HTMLDocument,HTMLElement,ClassList,"+                         // HTML
    "ElementView",                                                 // CSS Object Model
  
  bind: function(node) {
    // Apply a base2 DOM Binding to a native DOM node.
    /*@if (@_jscript_version < 5.6)
    if (node && node.getElementById) {
      node.nodeType = 9;
    }
    /*@end @*/
    if (node && node.nodeType) {
      var id = (node.nodeType == 1 ? node.uniqueID : node.base2ID) || assignID(node);
      if (!_boundElementIDs[id]) {
        switch (node.nodeType) {
          case 1: // Element
            if (typeof node.className == "string") {
              // It's an HTML element, so use bindings based on tag name.
              (HTMLElement.bindings[node.tagName] || HTMLElement).bind(node);
            } else {
              Element.bind(node);
            }
            break;
          case 9: // Document
            if (node.getElementById) {
              HTMLDocument.bind(node);
            } else {
              Document.bind(node);
            }
            break;
          default:
            Node.bind(node);
        }
        _boundElementIDs[id] = true;
      }
    }
    return node;
  },
  
  isBound: function(node) {
    return !!_boundElementIDs[node.nodeType == 1 ? node.uniqueID : node.base2ID];
  }
});

eval(this.imports);

// legacy support
base2.DOM = pcopy(dom);
base2.DOM.namespace += "var DOM=dom;";
