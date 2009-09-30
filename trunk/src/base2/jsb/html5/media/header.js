
/*@cc_on @*/

new base2.Package(this);

eval(this.imports);

var _JAVA_ENABLED = detect("(java)");

var _MEDIA_TYPE = /^(audio|video)\/[\w-]+$/;

var _PROBABLY = {
  "audio/mp3":         1,
  "video/mp4":         1,
  "video/quicktime":   1,
  "video/x-flv":       1
};

var _MAYBE = {
  "audio/ogg":         1,
  "video/ogg":         1
};

var _USE_QT_PLAYER    = /(aac|mov|mp3|mp4)$/i,
    _USE_FLASH_PLAYER = /(aac|flv|mov|mp3|mp4)$/i,
    _USE_OGG_PLAYER   = /og[gv]$/i;

var _TRIM_URL     = /[\?#].*$/,
    _URL_RESOLVER = document.createElement("img");

var _QT_PLAYER = '\
<!--[if gt IE 6]>\n\
<object width="{WIDTH}" height="{HEIGHT+15}" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"><!\n\
[endif]--><!--[if !IE]><!-->\n\
<object width="{WIDTH}" height="{HEIGHT+15}" type="video/quicktime" data="{SRC}"><!--<![endif]-->\n\
<param name="src" value="{POSTER}" />\
<param name="href" value="{SRC}" />\
<param name="target" value="myself" />\
<param name="controller" value="{CONTROLS}" />\
<param name="enablejavascript" value="true" />\
<param name="autoplay" value="false" />\
<param name="autohref" value="{AUTOPLAY}" />\
<param name="kioskmode" value="false" />\
<param name="volume" value="{VOLUME}" />\
<param name="showlogo" value="false" />\
{FLASH_PLAYER}\
<!--[if gt IE 6]><!-->\n\
</object><!--<![endif]-->';

var _OGG_PLAYER = format('\
<applet code="com.fluendo.player.Cortado.class" archive="%1cortado.jar" width="{WIDTH}" height="{HEIGHT}">\
<param name="url" value="{SRC}">\
<param name="autoPlay" value="{AUTOPLAY}" />\
<param name="audio" value="{!MUTED}" />\
<param name="BufferSize" value="4096" />\
<param name="BufferHigh" value="25" />\
<param name="BufferLow" value="5" />\
</applet>',
jsb.host);

var _POSTER = '<a href="{SRC}"><img src="{POSTER}" width="{WIDTH}" height="{HEIGHT}" alt="download" /></a>';
