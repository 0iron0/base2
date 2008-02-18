
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
      var chrome = Chrome.getComputedStyle(element, "color");
      element.style.color = "";
      if (_MSIE) body.removeChild(element);
      if (/rgb/.test(chrome)) chrome = eval(chrome);
      this.load(_XP_DETECT[chrome]);
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
    this.createStyleSheet(format(_STYLES, this, _THEMES[this.name] || "", this.prefix));
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
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale"
};

var _cssText = "padding:2px;border:1px solid ";
var _THEMES = {
  "classic": "",
  "luna/blue": _cssText + "#7f9db9;",
  "luna/olive": _cssText + "#a4b97f;",
  "luna/silver": _cssText + "#a5acb2;",
  "royale": _cssText + "#a7a6aa;"
};

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

chrome.theme = new Theme;
/*chrome.setTheme = function(path) {
  this.theme = new Theme(path);
};*/
