
var Theme = Base.extend({
  constructor: function(name) {
    this.load(name);
  },

  name: "default",

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

  load: function(name) {
    //return;
    if (name) this.name = name;
    this.createStyleSheet(format(css, this));
  },

  toString: function() {
    return chrome.host + this.name + "/";
  },

  "@MSIE": {
    createStyleSheet: function(cssText) {
      document.createStyleSheet().cssText = cssText;
    }
  }
}, {
  detect: K("default"),

  "@Windows": {
    detect: function() {
      var element = document.createElement("input");
      var head = NodeSelector.querySelector(document, "body,head");
      head.appendChild(element);
      // detect XP theme by inspecting the ActiveCaption colour
      element.style.color = "ActiveCaption";
      var color = element.style.color;
      if (!_XP_DETECT[color]) {
        color = ViewCSS.getComputedPropertyValue(document.defaultView, element, "color");
        if (/rgb/.test(color)) color = eval(color);
      }
      head.removeChild(element);
      return _XP_DETECT[color];
    },

    "@MSIE6": {
      detect: function() {
        return this.base() || {
      	"#ece9d8": "luna/blue",
      	"#e0dfe3": "luna/silver",
      	"#ebe9ed": "royale"
        }[document.documentElement.currentStyle.scrollbarFaceColor] || "classic";
      }
    },

    "@MSIE5": {
      detect: K("classic")
    }
  },

  "@Safari|Camino": {
    detect: K("aqua")
  }
});

var _XP_DETECT = {
  "#0a246a": "classic",
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale"
};

chrome.theme = Theme.detect();

base2.userAgent += ";theme=" + chrome.theme;

var rgba = rgb;
function rgb(r, g, b) {
  function toHex(value) {
    return (value < 16 ? "0" : "") + value.toString(16);
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

