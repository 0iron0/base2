
jsb.theme = new Base({
  detect: K("default"),

  "@Windows": {
    detect: function() {
      return _WIN_DETECT[_getActiveCaptionColor()] || "royale";
    },

    "@NT6": { // vista
      detect: function() {
        return _WIN_DETECT[_getActiveCaptionColor()] || "aero";
      }
    },

    "@NT5": { // xp
      detect: function() {
        return _WIN_DETECT[_getActiveCaptionColor()] || "royale";
      },

      "@MSIE": {
        detect: function() {
          var value = _WIN_DETECT[_getActiveCaptionColor()],
              scrollbarFaceColor = _documentElement.currentStyle.scrollbarFaceColor;
          if (value == "classic") {
            if (scrollbarFaceColor == "#ffffff") return "classic/contrast/white";
            if (scrollbarFaceColor == "#88c0b8") return "classic/marine";
          }
          return value || ({
            "#ece9d8": "luna/blue",
            // can't detect olive using scrollbar colour technique
            "#e0dfe3": "luna/silver",
            "#ebe9ed": "royale"
          }[scrollbarFaceColor]) || "royale";
        }
      }
    },

    "@MSIE5": {
      detect: K("classic")
    }
  },
  
  "@Linux": {
    detect: function() {
      return _LINUX_DETECT[_getActiveCaptionColor()] || "default";
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
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale",
  "#5e81bc": "royale",
  "#99b4d1": "aero",
  "#c4cbde": "aero",
  "#343434": "zune",
  "#c09f79": "human",
  "#83a67f": "smooth",
  "#000080": "classic",
  "#0a246a": "classic/standard",
  "#800000": "classic/brick",
  "#008080": "classic/desert",
  "#588078": "classic/eggplant",
  "#5a4eb1": "classic/lilac",
  "#484060": "classic/plum",
  "#808000": "classic/wheat",
  "#800080": "classic/contrast/black",
  "#000000": "classic/contrast/white",
  "#0000ff": "classic/contrast/high1",
  "#00ffff": "classic/contrast/high2"
}, _LINUX_DETECT = {
  "#c4c6c0": "clearlooks",
  "#eae8e3": "clearlooks",
  "#dfe4e8": "clearlooks",
  "#eaeaea": "clearlooks",
  "#edeceb": "clearlooks",
  "#efebe7": "human"
};

var rgba = rgb;

jsb.theme.toString = K(jsb.theme.detect() || "default");

base2.userAgent += ";theme=" + jsb.theme;

function rgb(r, g, b) {
  function toHex(value) {
    return (value < 16 ? "0" : "") + value.toString(16);
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
};

function _getActiveCaptionColor() {
  var element = _document.createElement("input");
  var head = behavior.querySelector("body,head");
  head.appendChild(element);
  // detect XP theme by inspecting the ActiveCaption colour
  element.style.color = "ActiveCaption";
  var color = element.style.color;
  if (!_WIN_DETECT[color]) {
    color = ViewCSS.getComputedPropertyValue(_document.defaultView, element, "color");
    if (/rgb/.test(color)) color = eval(color);
  }
  head.removeChild(element);
  return color;
};
