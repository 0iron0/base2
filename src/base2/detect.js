
function detect(_no_shrink_) {
  // Two types of detection:
  //  1. Object detection
  //    e.g. detect("(java)");
  //    e.g. detect("!(document.addEventListener)");
  //  2. Platform detection (browser sniffing)
  //    e.g. detect("MSIE");
  //    e.g. detect("MSIE|opera");

  var jscript = NaN/*@cc_on||@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
  var java = global.java ? true : false;
  var _lookup = {};
  if (global.navigator) {
    var MSIE = /MSIE[\d.]+/g;
    _lookup.document = document;
    var element = _lookup.element = document.createElement("span");
    element.expando = true;
    //var event = document.createEvent ? document.createEvent("UIEvents") : document.createEventObject ? document.createEventObject() : {};
    // Close up the space between name and version number.
    //  e.g. MSIE 6 -> MSIE6
    var userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
    // Fix opera's (and others) user agent string.
    if (!jscript) userAgent = userAgent.replace(MSIE, "");
    if (/KHTML/.test(userAgent)) userAgent = userAgent.replace("Gecko", "");
    if (MSIE.test(userAgent)) userAgent = userAgent.match(MSIE)[0] + " " + userAgent.replace(MSIE, "");
    userAgent = navigator.platform + " " + userAgent;
    java &= navigator.javaEnabled();
  }

  var _cache = {};
  detect = function(expression) {
    if (_cache[expression] == null) {
      var returnValue = false, test = expression;
      var not = test.charAt(0) == "!";
      if (not) test = test.slice(1);
      if (test.charAt(0) == "(") {
        // Object detection.
        if (/^\((element|document)\.\w+\)$/.test(test)) {
          test = test.slice(1, -1).split(".");
          returnValue = !!_lookup[test[0]][test[1]];
        } else {
          try {
            eval("var _returnValue=!!" + test);
            returnValue = _returnValue;
          } catch (x) {
            // the test failed
          }
        }
      } else {
        // Browser sniffing.
        returnValue = new RegExp("(" + test + ")", "i").test(userAgent);
      }
      _cache[expression] = !!(not ^ returnValue);
    }
    return _cache[expression];
  };
  
  return detect(arguments[0]);
};
