
// An interface shared by audio/video.

var media = jsb.behavior.extend({
  NETWORK_EMPTY:     0,
  NETWORK_IDLE:      1,
  NETWORK_LOADING:   2,
  NETWORK_LOADED:    3,
  NETWORK_NO_SOURCE: 4,
  
  HAVE_NOTHING:      0,
  HAVE_METADATA:     1,
  HAVE_CURRENT_DATA: 2,
  HAVE_FUTURE_DATA:  3,
  HAVE_ENOUGH_DATA:  4,

  src: "",
  autobuffer: false,

  currentTime: 0,
  defaultPlaybackRate: 0,
  playbackRate: 0,
  autoplay: false,
  loop: false,
  
  controls: false,
  volume: 1,
  muted: false,
  
  get: function(element, propertyName) {
    switch (propertyName) {
      case "error":
        return null;
        
      case "currentSrc":
        return "";
        
      case "networkState":
        return this.NETWORK_EMPTY;
        
      case "buffered":
        return null;
        
      case "readyState":
        return this.HAVE_NOTHING;
        
      case "seeking":
        return false;
        
      case "startTime":
        return 0;
        
      case "duration":
        return 0;

      case "paused":
        return false;

      case "played":
        return null;

      case "seekable":
        return null;

      case "ended":
        return false;
    }
    
    return this.base(element, propertyName);
  },

  canPlayType: function(type) {
    if (_PROBABLY[type]) return "probably";
    if (_MAYBE[type]) return "maybe";
    var mimeTypes = navigator.mimeTypes;
    if (mimeTypes) {
      var mimeType = mimeTypes[type];
      if (mimeType && mimeType.enabledPlugin) return "maybe";
    }
    return "";
  },

  load: Undefined,
  pause: Undefined,
  play: Undefined
});
