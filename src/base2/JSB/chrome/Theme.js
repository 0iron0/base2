
var Theme = Base.extend({
  constructor: function(name) {
    this.load(name);
  },

  cssText: "",
  name: "default",

  createStyleSheet: function() {
    if (document.body) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.textContent = this.cssText;
      new Selector("head").exec(document, 1).appendChild(style);
    } else {
      document.write(format('<style type="text/css">%1<\/style>', this.cssText));
    }
  },

  load: function(name) {
    if (name) this.name = name;
    this.cssText = format(css, this);
    this.createStyleSheet();
  },

  toString: function() {
    return chrome.host + this.name + "/";
  },

  "@MSIE": {
    createStyleSheet: function() {
      document.createStyleSheet().cssText = this.cssText;
    }
  }
}, {
  detect: K("default"),

  "@Windows": {
    detect: function() {
      var element = document.createElement("input");
      var head = behavior.querySelector("body,head");
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

  "@Webkit([1-4]|5[01]|52[^89])|Camino|Mac": {
    detect: K("aqua"),

    "@Chrome|Arora": {
      detect: K("luna/blue")
    }
  }
});

var _XP_DETECT = {
  "#0a246a": "classic",
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale"
};

var rgba = rgb;

chrome.theme = Theme.detect();

base2.userAgent += ";theme=" + chrome.theme;

function rgb(r, g, b) {
  function toHex(value) {
    return (value < 16 ? "0" : "") + value.toString(16);
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};
