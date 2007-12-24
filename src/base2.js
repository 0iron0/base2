/*
  base2 - copyright 2007, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php
  
  Contributors:
    Doeke Zanstra
*/

var base2 = {
  name:    "base2",
  version: "1.0 (beta 2)",
  exports:
    "Base,Package,Abstract,Module,Enumerable,Map,Collection,RegGrp,"+
    "assert,assertArity,assertType,assignID,copy,detect,extend,"+
    "forEach,format,global,instanceOf,match,rescape,slice,trim,typeOf,"+
    "I,K,Undefined,Null,True,False,bind,delegate,flip,not,unbind",
  
  global: this, // the window object in a browser environment
  
  // this is defined here because it must be defined in the global scope
  detect: new function(_) {  
    // Two types of detection:
    //  1. Object detection
    //    e.g. detect("(java)");
    //    e.g. detect("!(document.addEventListener)");
    //  2. Platform detection (browser sniffing)
    //    e.g. detect("MSIE");
    //    e.g. detect("MSIE|opera");
        
    var global = _;
    var jscript = NaN/*@cc_on||@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
    var java = _.java ? true : false;
    if (_.navigator) {
      var element = document.createElement("span");
      // Close up the space between name and version number.
      //  e.g. MSIE 6 -> MSIE6
      var userAgent = navigator.platform + " " + navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
      // Fix opera's (and others) user agent string.
      if (!jscript) userAgent = userAgent.replace(/MSIE[\d.]+/, "");
      java &= navigator.javaEnabled();
    }
    
    return function(expression) {
      var r = false;
      var not = expression.charAt(0) == "!";
      if (not) expression = expression.slice(1);
      if (expression.charAt(0) == "(") {
        // Object detection.
        try {
          eval("r=!!" + expression);
        } catch (error) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        r = new RegExp("(" + expression + ")", "i").test(userAgent);
      }
      return !!(not ^ r);
    };
  }(this)
};
