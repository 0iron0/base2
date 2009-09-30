
// JavaScript Behaviors.

base2.global.jsb = new base2.Package(this, {
  name:    "jsb",
  version: "0.9.7",
  imports: "Function2,Enumerable,dom",
  exports: "Animation,Rule,RuleList,behavior",

  INTERVAL:  25, // milliseconds

  // Max time for hogging the processor.
  TIMEOUT: 100, // milliseconds

  // Restrict the number of elements returned by a DOM query.
  // This ensures that the tick() function does not run for too long.
  // It also ensures that elements are returned in batches appropriate
  // for consistent rendering.
  QUERY_SIZE: 100,

  // Simple style sheet creation.
  // This is overridden later to provide more complex style sheets.

  createStyleSheet: function(cssText) {
    if (document.body) {
      var style = document.createElement("style");
      style.type = "text/css";
      if (style.textContent === undefined) {
        style.innerHTML = cssText;
      } else {
        style.textContent = cssText;
      }
      new Selector("head").exec(document, 1).appendChild(style);
    } else {
      document.write('<style type="text/css">' + cssText + '<\/style>');
    }
  },

  "@(document.createStyleSheet)": {
    createStyleSheet: function(cssText) {
      document.createStyleSheet().cssText = cssText;
    }
  }
});

eval(this.imports);

;;; if (typeof console2 == "undefined") global.console2={log:Undefined,update:Undefined};

jsb.host = _getCurrentHost();
