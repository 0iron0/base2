
var _STYLES = '\
.chrome\
\
{%2\
;background-position:9999px 9999px\
;background-attachment:scroll!important\
;background-repeat:no-repeat!important\
}\
.progressbar,.slider\
\
{text-indent:-10em\
;cursor:default\
;-webkit-user-select:none\
}\
\
.progressbar_focus,.slider_focus\
\
{-moz-outline:1px dotted\
}\
\
.progressbar\
\
{border:2px solid ThreeDDarkShadow\
;%3border-top-colors:ThreeDDarkShadow ThreeDHighlight\
;%3border-right-colors:ThreeDDarkShadow ThreeDHighlight\
;%3border-left-colors:ThreeDDarkShadow ThreeDHighlight\
;%3border-bottom-colors:ThreeDDarkShadow ThreeDHighlight\
;%3border-radius:2px\
;background-image:url("%1progressbar.png")!important\
}\
\
.slider\
\
{\
_height:17px\
;min-height:17px\
;padding:3px\
;border:0\
;background-image:url("%1slider.png")!important\
}\
\
.popup\
{display:none\
;position:absolute!important\
;z-index:999999!important\
;cursor:default!important\
;padding:0!important\
;margin:0;!important\
;border:1px solid black!important\
;border-style:outset\
}\
\
.spinner\
\
{text-align:right\
;width:5em\
;padding-right:19px!important\
;background-image:url("%1spinner.png")!important\
}';

_STYLES += '\n.combobox{' + (detect("WebKit") ?
'%3appearance:menulist!important}' :
'padding-right:19px!important\
;width:8em\
;background-image:url("%1menulist.png")!important\
}');

if (detect("KHTML|opera[91]")) _STYLES += '\
[type=range]\
{height:initial\
;padding:initial\
;border:initial\
}';

if (_MSIE) _STYLES += "\
\
.popup\
{border-color:%4!important\
}\
\
.progressbar,.slider\
\
{text-indent:0\
;line-height:80em\
}";

if (detect("Gecko")) _STYLES += ".popup{border-style:outset!important}";
