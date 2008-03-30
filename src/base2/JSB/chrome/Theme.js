
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
      document.write("<span id=b2_tmp style='display:none;zoom:1'></span>");
      var element = document.getElementById("b2_tmp");
      // detect XP theme by inspecting the ActiveCaption colour
      element.style.color = "ActiveCaption";
      var color = element.style.color;
      if (!_XP_DETECT[color]) {
        color = ViewCSS.getComputedStyle(document.defaultView, element, null).color;
        if (/rgb/.test(color)) color = eval(color);
      }
      element.parentNode.removeChild(element);
      return _XP_DETECT[color];
    },

    "@MSIE5": {
      detect: K("classic")
    }
  },

  "@Safari": {
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

