
var Theme = Base.extend({
  constructor: function(name) {
    if (!name) this.detect();
    else this.load(name);
  },
  
  detect: _defaultTheme,

  "@Windows": {
    detect: function() {
      if (_MSIE) {
        var body = document.body;
        if (body) {
          var element = document.createElement("div");
          element.style.width = "0";
          body.appendChild(element);
        } else {
          setTimeout(bind(arguments.callee, this), 1);
          return;
        }
      } else element = document.documentElement;
      // detect XP theme by inspecting the ActiveCaption colour
      element.style.color = "ActiveCaption";
      var color = Chrome.getComputedStyle(element, "color");
      element.style.color = "";
      if (_MSIE) body.removeChild(element);
      if (/rgb/.test(color)) color = eval(color);
      this.load(_XP_DETECT[color]);
    }
  },

  "@KHTML|Mac": {
    detect: _defaultTheme
  },
  
  name: "luna/blue",
  host: "http://rekky.rosso.name/base2/trunk/src/base2/JSB/chrome/",
  prefix: "",

  "@Gecko": {
    prefix: "-moz-"
  },

  "@Webkit": {
    prefix: "-webkit-"
  },
  
  load: function(name) {
    //return;
    if (name) this.name = name;
    this.createStyleSheet(format(_STYLES, this, _THEMES[this.name] || "", this.prefix, _BORDER_COLORS[this.name] || ""));
  },

  createStyleSheet: function(cssText) {
    if (document.body) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.textContent = cssText;
      new Selector("head").exec(document, 1).appendChild(style);
    } else {
      document.write(format('<style type="text/css">%1<\/style>', cssText));
    }
  },

  "@MSIE": {
    createStyleSheet: function(cssText) {
      document.createStyleSheet().cssText = cssText;
    }
  },

  toString: function() {
    return this.host + this.name + "/";
  }
});

var _XP_DETECT = {
  "#0a246a": "classic",
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale"
};

var _BORDER_COLORS = {
  "classic": "#000000",
  "luna/blue": "#7f9db9",
  "luna/olive": "#a4b97f",
  "luna/silver": "#a5acb2",
  "royale": "#a7a6aa"
};

var _THEMES = reduce(_BORDER_COLORS, function(themes, color, theme) {
  themes[theme] = "padding:2px;border:1px solid " + color;
  return themes;
}, {});
_THEMES.classic = "padding:1px 0;-moz-border-top-colors:ThreeDShadow ThreeDDarkShadow\
;-moz-border-right-colors:ThreeDHighlight ThreeDLightShadow\
;-moz-border-left-colors:ThreeDShadow ThreeDDarkShadow\
;-moz-border-bottom-colors:ThreeDHighlight ThreeDLightShadow\
";
if (detect("WebKit")) _THEMES.classic += ";padding:1px;border-style:solid;border-width:2px 1px 1px 2px;border-color:#444 #ddd #ddd #444";

var rgba = rgb;
function rgb(r, g, b) {
  function toHex(value) {
    return (value < 16 ? "0" : "") + value.toString(16);
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

function _defaultTheme() {
  this.load(this.name);
};

chrome.theme = new Theme("aqua");
/*chrome.setTheme = function(path) {
  this.theme = new Theme(path);
};*/
