
var _CANVAS_JS = "canvas.js";
;;; _CANVAS_JS = "canvas.php";

_registerElement("canvas", {
  detect: "getContext",

  display: "block",

  // if <canvas> is not implemented then we can at least support it for MSIE
  behavior: detect("MSIE") ? _CANVAS_JS + "#html5.canvas" : null,
  
  methods: "getContext"
});
