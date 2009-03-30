
function detect() {
  // Two types of detection:
  //  1. Object detection
  //    e.g. detect("(java)");
  //    e.g. detect("!(document.addEventListener)");
  //  2. Platform detection (browser sniffing)
  //    e.g. detect("MSIE");
  //    e.g. detect("MSIE|Opera");

  var jscript = NaN/*@cc_on||@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
  var javaEnabled = global.java ? true : false;
  if (global.navigator) { // browser
    var MSIE = /MSIE[\d.]+/g;
    var element = document.createElement("span"),
        style = element.style;
    element.expando = 1;
    // Close up the space between name and version number.
    //  e.g. MSIE 6 -> MSIE6
    var userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
    // Fix Opera's (and others) user agent string.
    if (!jscript) userAgent = userAgent.replace(MSIE, "");
    if (MSIE.test(userAgent)) userAgent = userAgent.match(MSIE)[0] + " " + userAgent.replace(MSIE, "");
    if (/Gecko/.test(userAgent)) userAgent = userAgent.replace(/rv:/, "Gecko");
    if (!/Compat$/.test(document.compatMode)) userAgent += ";QuirksMode";
    base2.userAgent = navigator.platform + " " + userAgent.replace(/like \w+/gi, "");
    javaEnabled &= navigator.javaEnabled();
//} else if (java) { // rhino
//  var System = java.lang.System;
//  base2.userAgent = "Rhino " + System.getProperty("os.arch") + " " + System.getProperty("os.name") + " " + System.getProperty("os.version");
//} else if (jscript) { // Windows Scripting Host
//  base2.userAgent = "WSH";
  }

  var _cache = {};
  detect = function(expression) {
    if (_cache[expression] == null) {
      var returnValue = false, test = expression;
      var not = test.indexOf("!") == 0;
      if (not) test = test.slice(1);
      if (test.indexOf("(") == 0) {
        try {
          returnValue = new Function("element,style,jscript,java,global", "return !!" + test)(element, style, jscript, javaEnabled, global);
        } catch (ex) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        returnValue = new RegExp("(" + test + ")", "i").test(base2.userAgent);
      }
      _cache[expression] = !!(not ^ returnValue);
    }
    return _cache[expression];
  };
  
  return detect(arguments[0]);
};
