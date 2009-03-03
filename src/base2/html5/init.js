
var _testCanvas = document.createElement("canvas");

if (_testCanvas.getContext) {
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

var _cssText = new RegGrp({
  "\\.jsb\\-progressbar": "progress",
  "\\.jsb\\-colorpicker": "input[type=color]"
}).exec(jsb.theme.cssText);

if (!detect("Opera")) { // TODO: check document.implementation
  style["[repeat=template],.html5-template"] = {display:"none"};
  _cssText = new RegGrp({
    "\\.jsb\\-combobox": "input[list]",
    "\\.jsb\\-spinner": "input[type=number]",
    "\\.jsb\\-slider": "input[type=range]"
  }).exec(_cssText);
}

jsb.createStyleSheet(style);

jsb.createStyleSheet(_cssText);
