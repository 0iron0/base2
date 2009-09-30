
// Thanks to:
//  http://camendesign.com/code/video_for_everybody

html5.video = media.extend({
  width: 300,
  height: 150,
  poster: "",
  
  oncontentready: function(element) {
    // Don't bother initialising other video elements if installing Flash.
    if (document.getElementById("html5-flash-installer")) return;
    
    var style    = element.style,
        src      = this.get(element, "currentSrc"),
        ext      = src.replace(_TRIM_URL, ""),
        poster   = this.get(element, "poster"),
        autoplay = this.get(element, "autoplay"),
        muted    = this.get(element, "muted"),
        width    = this.get(element, "width"),
        height   = this.get(element, "height"),
        template = _USE_FLASH_PLAYER.test(ext) ? _QT_PLAYER : _USE_OGG_PLAYER.test(ext) ? _OGG_PLAYER : _POSTER;

    // Hide the control whilst writing to it.
    if (autoplay) style.visibility = "hidden";
    
    // Create the content.
    element.innerHTML += template
      .replace(/{FLASH_PLAYER}/, _flashVersion > 5 && _flashVersion < 9 ?
        _FLASH_INSTALLER :
        _FLASH_PLAYER.replace(/{VARS}/g,
          _FLASH_VARS
            .replace("{SRC}", _ENCODER.exec(src))
            .replace("{POSTER}", _ENCODER.exec(poster))))
      .replace(/{SRC}/g, src)
      .replace(/{POSTER}/g, poster)
      .replace(/{AUTOPLAY}/g, autoplay)
      .replace(/{CONTROLS}/g, this.get(element, "controls"))
      .replace(/{LOOP}/g, this.get(element, "loop"))
      .replace(/{!MUTED}/, !muted)
      .replace(/{MUTED}/g, muted)
      .replace(/{VOLUME}/g, this.get(element, "volume") * 100)
      .replace(/{WIDTH}/g, width)
      .replace(/{HEIGHT(\+\d+)?}/g, function(match, adjust) {
        return height + (parseInt(adjust) || 0);
      });
    // TO DO: check the spec for this behavior -@DRE
    if (width) style.width = width + "px";
    if (height) style.height = height + "px";

    // Create a small delay before re-showing the control.
    // This fixes a bug in the QT player in MSIE.
    if (autoplay) setTimeout(function() {
      style.visibility = "";
    }, 15);
  },

  get: function(element, propertyName) {
    switch (propertyName) {
      case "currentSrc":
        var src = this.get(element, "src");
        // Prefer MP4 (supportable by flash and <object>).
        // (OGG is only supportable with Java).
        if (!_USE_QT_PLAYER.test(src.replace(_TRIM_URL, ""))) {
          var source = this.querySelector(element, "source[type$=mp4]") ||
                       this.querySelector(element, "source[type$=ogg]");
          if (source) src = this.getAttribute(source, "src");
        }
        if (!src) return "";
        
        // Use a script element to resolve URLs.
        _URL_RESOLVER.src = src;
        return _URL_RESOLVER.src;
        
      case "videoWidth":
        return 0;

      case "videoHeight":
        return 0;
    }

    return this.base(element, propertyName);
  }
});
