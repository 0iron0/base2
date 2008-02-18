
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
;background-color:transparent\
;background-image:url("%1slider.png")!important\
}\
\
.spinner\
\
{text-align:right\
;width:5em\
;padding-right:19px!important\
;background-image:url("%1spinner.png")!important\
}';

if (detect("KHTML|opera[91]")) _STYLES += '\
[type=range]\
{height:initial\
;padding:initial\
;border:initial\
}';

if (_MSIE) _STYLES += "\
\
.progressbar,.slider\
\
{text-indent:0\
;line-height:80em\
}";
