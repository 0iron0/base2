
var _MEDIA_JS = "media.js";
;;; _MEDIA_JS = "media.php";

var _MEDIA_METHODS = "canPlayType,load,play,pause";

_registerElement("audio", {
  detect: "play",
  
  display: "none",
  
  extraStyles: {
    "audio[controls]": {
      display: "inline"
    }
  },
  
  methods: _MEDIA_METHODS,

  behavior: _MEDIA_JS + "#html5.audio"
});

_registerElement("video", {
  detect:  "play",

  display: "block",
  
  style: {
    width: "300px",
    height: "150px"
  },

  methods: _MEDIA_METHODS,

  behavior: _MEDIA_JS + "#html5.video"
});
