
// JavaScript Behaviors

var JSB = new base2.Package(this, {
  name:    "JSB",
  version: "0.9.1",
  imports: "Function2,Enumerable,DOM,DOM.EventTarget",
  exports: "Behavior,Rule,RuleList,MouseCapture,ExtendedMouse"
});

eval(this.imports);

