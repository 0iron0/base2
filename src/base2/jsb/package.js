
// JavaScript Behaviors

base2.global.jsb = new base2.Package(this, {
  name:    "jsb",
  version: "0.9.4",
  imports: "Function2,DOM",
  exports: "Rule,RuleList,behavior"
});

eval(this.imports);

;;; if (typeof console2 == "undefined") global.console2={log:Undefined,update:Undefined};
