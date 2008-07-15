
// Dean Edwards, 2008

(function() {
var CONSOLE_CSS = "position:fixed;top:0;right:0;height:800px;width:25%;border:1px solid silver;overflow:auto;background:white";
var lines = [];
if (typeof console2 == "undefined") {
  if (document.body) {
    console2 = document.createElement("pre");
    console2.style.cssText = CONSOLE_CSS;
    document.body.appendChild(console2);
  } else {
    document.write('<pre id="console2" style="' + CONSOLE_CSS + '"></pre>');
    try {
      console2 = document.getElementById("console2");
    } catch (e){}
  }
  if (!console2) {
    console2 = {temp: 1};
  }
  console2.log = function(line) {
    if (lines) {
      lines.push(line);
    } else {
      this.innerHTML = line + "<br>" + this.innerHTML;
      //this.scrollTop = this.scrollHeight;
    }
  };
  console2.update = function() {
    if (console2.temp) {
      var temp = document.getElementById("console2");
      if (temp) {
        console2 = temp;
        for (var i in this) {
          if (i != "temp") console2[i] = this[i];
        }
      }
      setTimeout(function() {
        console2.update();
      }, 0);
    } else {
      this.innerHTML = lines.reverse().join("<br>") + "<br>";
      //this.scrollTop = this.scrollHeight;
      lines = null;
    }
  };
  console2.ondblclick = function() {
    this.innerHTML = "";
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
