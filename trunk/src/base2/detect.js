
function detect() {
  // Two types of detection:
  //  1. Object detection
  //    e.g. detect("(java)");
  //    e.g. detect("!(document.addEventListener)");
  //  2. Platform detection (browser sniffing)
  //    e.g. detect("MSIE");
  //    e.g. detect("MSIE|Opera");

  var jscript = NaN/*@cc_on||@_jscript_version@*/, // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
      javaEnabled = true;
  if (global.navigator) { // browser
    var MSIE    = /MSIE[\d.]+/g,
        element = document.createElement("span"),
        input   = document.createElement("input"),
        style   = element.style,
        // Close up the space between name and version number.
        //  e.g. MSIE 6 -> MSIE6
        userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
    javaEnabled &= navigator.javaEnabled();
    // Fix Opera's (and others) user agent string.
    if (!jscript) userAgent = userAgent.replace(MSIE, "");
    if (/MSIE/.test(userAgent)) {
      userAgent = userAgent.match(MSIE)[0] + ";" + userAgent
        .replace(MSIE, "")
        .replace(/user\-agent.*$/i, ""); // crap gets appended here
    }
    ;;; userAgent = userAgent.replace(/\.NET CLR[\d\.]*/g, "");
    // Chrome is different enough that it counts as a different vendor.
    // Sniff for Webkit unless you specifically want either Chrome or Safari.
    // Arora is treated as Safari.
    if (/Chrome/.test(userAgent)) userAgent = userAgent.replace(/Safari[\d.]*/gi, "");
    else if (/Gecko/.test(userAgent)) userAgent = userAgent.replace(/Gecko/g, "Gecko/").replace(/rv:/, "Gecko");
    if (!/^CSS/.test(document.compatMode)) userAgent += ";QuirksMode";
    base2.userAgent = userAgent.replace(/like \w+/gi, "") + ";" + navigator.platform;
//} else if (java) { // rhino
//  var System = java.lang.System;
//  base2.userAgent = "Rhino " + System.getProperty("os.arch") + " " + System.getProperty("os.name") + " " + System.getProperty("os.version");
//} else if (jscript) { // Windows Scripting Host
//  base2.userAgent = "WSH";
  }

  var _cache = {};
  detect = function(expression) {
    var not = expression.indexOf("!") == 0;
    if (not) expression = expression.slice(1);
    if (_cache[expression] == null) {
      var returnValue = false,
          test = expression;
      if (test.indexOf("(") == 0) { // Feature detection
        if (base2.dom) {
          test = test
            .replace(/(hasFeature)/, "document.implementation.$1")
            .replace(/\bstyle\.(\w+)/g, function(match, propertyName) {
              if (!style[propertyName]) {
                propertyName = base2.dom.CSSStyleDeclaration.getPropertyName(propertyName);
              }
              return "style." + propertyName;
            })
            .replace(/^\((\w+\.[\w\.]+)\)$/, function(match, feature) {
              feature = feature.split(".");
              var propertyName = feature.pop(), object = feature.join(".");
              return "(" +
                (jscript < 5.6 ?
                  object + "." + propertyName + "!==undefined" :
                  "'" + propertyName + "' in " + object) +
              ")";
            });
        }
        try {
          returnValue = new Function("global,element,input,style,jscript,java", "return !!" + test)(global, element, input, style, jscript, javaEnabled ? global.java : null);
        } catch (x) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        returnValue = new RegExp("(" + test + ")", "i").test(base2.userAgent);
      }
      _cache[expression] = returnValue;
    }
    return !!(not ^ _cache[expression]);
  };
  
  detect.MSIE = !!jscript;
  detect.MSIE5 = jscript < 5.6;
  
  return detect(arguments[0]);
};
