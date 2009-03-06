
var _testCanvas = document.createElement("canvas");

if (_testCanvas.getContext) {
  html5.canvas = behavior.extend({
    getContext: function(canvas, context) {
      return canvas.getContext(context);
    }
  });
} else {
  style.canvas = {
    display: "block"
  };
  
  if (detect("MSIE")) {
    html5.rules.put("canvas", host + "canvas.php#html5.canvas");
  }
}

var _cssText = new RegGrp({
  "\\*?\\.jsb\\-progressbar\\s": "progress ",
  "\\*?\\.jsb\\-colorpicker\\s": "input[type=color] "
}).exec(jsb.theme.cssText);

if (!_SUPPORTS_WEB_FORMS2) {
  style["[repeat=template],.html5-template"] = {display:"none"};
  _cssText = new RegGrp({
    "\\*?\\.jsb\\-combobox": "input[list]",
    "\\*?\\.jsb\\-spinner": "input[type=number]",
    "\\*?\\.jsb\\-slider": "input[type=range]"
  }).exec(_cssText);
}

jsb.createStyleSheet(style);

jsb.createStyleSheet(_cssText);
