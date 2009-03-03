
// JavaScript Behaviors

base2.global.jsb = new base2.Package(this, {
  name:    "jsb",
  version: "0.9.5",
  imports: "Function2,Enumerable,DOM",
  exports: "Rule,RuleList,behavior",
  
  INTERVAL:  1, // milliseconds

// Max time for hogging the processor.
  TIMEOUT: 200, // milliseconds

// Restrict the number of elements returned by a DOM query.
// This ensures that the tick() function does not run for too long.
// It also ensures that elements are returned in batches appropriate
// for consistent rendering.
  QUERY_SIZE: 200,

  createStyleSheet: function(cssText) {
    if (document.body) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.textContent = cssText;
      new Selector("head").exec(document, 1).appendChild(style);
    } else {
      document.write(format('<style type="text/css">%1<\/style>', cssText));
    }
  },

  "@MSIE": {
    createStyleSheet: function(cssText) {
      document.createStyleSheet().cssText = cssText;
    }
  }
});

eval(this.imports);

;;; if (typeof console2 == "undefined") global.console2={log:Undefined,update:Undefined};
