
// Dean Edwards, 2008

(function() {
var CONSOLE_CSS = "position:fixed;top:0;right:0;height:800px;width:320px";
var lines = [];
if (typeof console2 == "undefined") {
  if (document.body) {
    console2 = document.createElement("textarea");
    console2.style.cssText = CONSOLE_CSS;
    document.body.appendChild(console2);
  } else {
    document.write('<textarea id=console2 style="' + CONSOLE_CSS + '"></textarea>');
    try {
      console2 = document.getElementById("console2");
    } catch (e){}
  }
  console2.value = "";
  console2.log = function(line) {
    if (lines) {
      lines.push(line);
    } else {
      this.value = line + "\r\n" + this.value;
      //this.scrollTop = this.scrollHeight;
    }
  };
  console2.update = function() {
    this.value = lines.reverse().join("\r\n") + "\r\n";
    //this.scrollTop = this.scrollHeight;
    lines = null;
  };
  console2.ondblclick = function() {
    this.value = "";
  };
  // fixed positioning for MSIE6
  if (console2.runtimeStyle && navigator.appVersion.match(/MSIE (\d\.\d)/)[1] < 7) {
    setTimeout(function() {
      if (document.body) {
        with (document.body.style) {
          backgroundRepeat = "no-repeat";
          backgroundImage = "url(http://ie7-js.googlecode.com/svn/trunk/lib/blank.gif)"; // dummy
          backgroundAttachment = "fixed";
        }
        with (console2.style) {
          position = "absolute";
          setExpression("pixelRight", "parseInt(document.documentElement.scrollLeft)");
          setExpression("pixelTop", "parseInt(document.documentElement.scrollTop)");
          setExpression("pixelBottom", "parseInt(document.documentElement.scrollHeight-document.documentElement.scrollTop)");
        }
      } else setTimeout(arguments.callee, 15);
    }, 15);
  }
}
})();
