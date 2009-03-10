
jsb.theme = new Base({
  detect: K("default"),

  "@Windows": {
    detect: function() {
      var element = document.createElement("input");
      var head = behavior.querySelector("body,head");
      head.appendChild(element);
      // detect XP theme by inspecting the ActiveCaption colour
      element.style.color = "ActiveCaption";
      var color = element.style.color;
      if (!_WIN_DETECT[color]) {
        color = ViewCSS.getComputedPropertyValue(document.defaultView, element, "color");
        if (/rgb/.test(color)) color = eval(color);
      }
      head.removeChild(element);
      return _WIN_DETECT[color];
    },

    "@MSIE": {
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

var _WIN_DETECT = {
  "#0a246a": "classic",
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale",
  "#99b4d1": "aero",
  "#343434": "zune"
};

var rgba = rgb;

jsb.theme.toString = K("aero/alternative");//K(jsb.theme.detect());

base2.userAgent += ";theme=" + jsb.theme;

function rgb(r, g, b) {
  function toHex(value) {
    return (value < 16 ? "0" : "") + value.toString(16);
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

