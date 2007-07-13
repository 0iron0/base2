
var DOM = new base2.Namespace(this, {
	name:    "DOM",
	version: "0.9 (alpha)",
	imports: "BOM",
	exports: "Node,Document,Element,Traversal,AbstractView,Event,EventTarget,DocumentEvent,Selector,DocumentSelector,ElementSelector,StaticNodeList,ViewCSS,HTMLDocument,HTMLElement,XPathParser"
});

eval(this.imports);
