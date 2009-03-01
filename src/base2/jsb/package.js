
// JavaScript Behaviors

base2.global.jsb = new base2.Package(this, {
  name:    "jsb",
  version: "0.9.4",
  imports: "Function2,DOM",
  exports: "Rule,RuleList,behavior",
  
  INTERVAL:  1, // milliseconds

// Max time for hogging the processor.
  TIMEOUT: 200, // milliseconds

// Restrict the number of elements returned by a DOM query.
// This ensures that the tick() function does not run for too long.
// It also ensures that elements are returned in batches appropriate
// for consistent rendering.
   QUERY_SIZE: 200
});

eval(this.imports);

;;; if (typeof console2 == "undefined") global.console2={log:Undefined,update:Undefined};
