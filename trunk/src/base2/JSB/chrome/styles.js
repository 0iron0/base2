
var PX = "px";
var _MSIE = detect("MSIE");

var _STYLES = '\
.chrome {\
 padding:%2px;\
 border:1px solid %3;\
 background-position:9999px 9999px;\
 background-repeat:no-repeat!important;\
}\
.progressbar,.slider {\
 text-indent:-10em; /* firefox/safari */\
 cursor:default;\
}\
.progressbar:focus {\
 -moz-outline:1px dotted;\
}\
.progressbar {\
 -height:15px;\
 margin: 2px 4px;\
 border: 2px solid ThreeDDarkShadow;\
 %4border-top-colors: ThreeDDarkShadow ThreeDHighlight;\
 %4border-right-colors: ThreeDDarkShadow ThreeDHighlight;\
 %4border-left-colors: ThreeDDarkShadow ThreeDHighlight;\
 %4border-bottom-colors: ThreeDDarkShadow ThreeDHighlight;\
 %4border-radius: 2px;\
 background-image:url("%1progressbar.png")!important;\
}';

if (detect("KHTML|opera[91]")) {
  _STYLES += '[type=range]{height:initial;padding:initial;border:initial}';
} else _STYLES +=
'.slider {\
 min-height:23px;\
 padding:1px 5px;\
 border:0;\
 background-color:transparent;\
 background-image:url("%1slider.png")!important;\
}\
.slider:focus {\
 outline:1px dotted;\
}';

if (!detect("opera[91]")) _STYLES +=
'.spinner {\
 text-align:right;\
 width:5em;\
 padding-right:19px!important;\
 background-image:url("%1spinner.png")!important;\
}';

if (_MSIE) _STYLES += ".progressbar,.slider{text-indent:0}";
