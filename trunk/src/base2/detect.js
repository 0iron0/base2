
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
  if (global.navigator) {
    var MSIE = /MSIE[\d.]+/g;
    var element = document.createElement("span");
    element._expando = true;
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

  detect = function(expression) {
    var _returnValue = false;
    var not = expression.charAt(0) == "!";
    if (not) expression = expression.slice(1);
    if (expression.charAt(0) == "(") {
      // Object detection.
      try {
        eval("_returnValue=!!" + expression);
      } catch (x) {
        // the test failed
      }
    } else {
      // Browser sniffing.
      _returnValue = new RegExp("(" + expression + ")", "i").test(userAgent);
    }
    return !!(not ^ _returnValue);
  };
  
  return detect(arguments[0]);
};

forEach.detect = function(object, block, context) {
  forEach (object, function(value, key) {
    if (key.charAt(0) == "@") { // object detection
      if (detect(name.slice(1))) forEach (value, arguments.callee);
      else block.call(context, value, key, object);
    }
  });
};
