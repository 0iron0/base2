
// Uses JW Player: http://www.longtailvideo.com/players/jw-flv-player/

// http://developer.longtailvideo.com/trac/wiki/FlashVars
var _ENCODER = new RegGrp({
  "\\?":   "%3F",
    "=":   "%3D",
    "&":   "%26"
});

var _FLASH_VARS = jsb.host +
  "player.swf?autostart={AUTOPLAY}&amp;repeat={LOOP}&amp;volume={VOLUME}&amp;mute={MUTED}&amp;image={POSTER}&amp;file={SRC}";

var _FLASH_PLAYER = '\
<object width="{WIDTH}" height="{HEIGHT+20}" type="application/x-shockwave-flash" data="{VARS}">\
<param name="movie" value="{VARS}">\
</object>';

var _FLASH_INSTALLER = format('\
<object id="html5-flash-installer" type="application/x-shockwave-flash" data="%1" width="{WIDTH}" height="{HEIGHT}">\
<param name="movie" value="%1">\
</object>',
  format("%1expressInstall.swf?MMredirectURL=%2&amp;MMplayerType=%3&amp;MMdoctitle=%4",
    jsb.host, _ENCODER.exec(location.href), detect.MSIE ? "ActiveX" : "PlugIn", _ENCODER.exec(document.title)));
      
var _flashVersion = 0;
/*@if (@_jscript)
try {
  _flashVersion = new ActiveXObject("ShockwaveFlash.ShockwaveFlash").GetVariable("$version").match(/\d+/)[0] - 0;
} catch(x) {
  for (var i = 9; i > 5; i--) {
    try {
      new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i);
      _flashVersion = i;
      break;
    } catch(x){}
  }
}
@else @*/
try {
  _flashVersion = navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin.description.match(/\d+/)[0] - 0;
} catch(x){}
/*@end @*/
