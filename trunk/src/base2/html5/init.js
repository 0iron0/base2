
var test = document.createElement("canvas");

if (test.getContext) {
  html5.canvas = element.extend({
    getContext: function(canvas, context) {
      return canvas.getContext(context);
    }
  });
} else {
  style.canvas = {
    display: "block"
  };
  
  if (detect("MSIE")) {
    html5.rules.put("canvas", jsb.host + "canvas.php#html5.canvas");
  }
}

jsb.createStyleSheet(style);
