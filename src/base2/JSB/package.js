
// JavaScript Behaviors

var JSB = new base2.Package(this, {
  name:    "JSB",
  version: "0.9.2",
  imports: "DOM",
  exports: "Behavior,Rule,RuleList,ExtendedMouse"
});

eval(this.imports);

;;; if (typeof console2 == "undefined") global.console2={log:Undefined,update:Undefined};
