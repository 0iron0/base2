/*
  base2 - copyright 2007, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license
  
  Contributors:
    Doeke Zanstra
*/

var base2 = {
  name:    "base2",
  version: "0.9 (alpha)",
  exports:
    "Base, Namespace, Abstract, Module, Enumerable, Hash, Collection, RegGrp, " +
    "Array2, Date2, String2, " +
    "assert, assertArity, assertType, " +
    "assignID, copy, detect, extend, forEach, format, instanceOf, match, rescape, slice, trim, " +
    "I, K, Undefined, Null, True, False, bind, delegate, flip, not, partial, returns, unbind",
  
  global: this, // the window object in a browser environment
  namespace: "var global=base2.global;function base(o,a){return o.base.apply(o,a)};",
    
  // this is defined here because it must be defined in the global scope
  detect: new function(_) {  
    // Two types of detection:
    //  1. Object detection
    //     e.g. detect("(java)");
    //     e.g. detect("!(document.addEventListener)");
    //  2. Platform detection (browser sniffing)
    //     e.g. detect("MSIE");
    //     e.g. detect("MSIE|opera");
        
    var global = _;
    var jscript/*@cc_on=@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
    var java = _.java;
    
    if (_.navigator) {
      var element = document.createElement("span");
      var platform = navigator.platform + " " + navigator.userAgent;
      // Fix opera's (and others) user agent string.
      if (!jscript) platform = platform.replace(/MSIE\s[\d.]+/, "");
      // Close up the space between name and version number.
      //  e.g. MSIE 6 -> MSIE6
      platform = platform.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
      java = navigator.javaEnabled() && java;
    }
    
    return function(test) {
      var r = false;
      var not = test.charAt(0) == "!";
      if (not) test = test.slice(1);
      test = test.replace(/^([^\(].*)$/, "/($1)/i.test(platform)");
      try {
        eval("r=!!" + test);
      } catch (error) {
        // the test failed
      }
      return !!(not ^ r);
    };
  }(this)
};
