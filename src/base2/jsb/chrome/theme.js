
jsb.theme = new Base({
  detect: K("default"),

  "@Windows": {
    defaultTheme: "classic",

    "@NT5\\.1": { // XP
      defaultTheme: "luna/blue"
    },

    "@NT[6-9]": { // Vista
      defaultTheme: "aero"
    },

    detect: function() {
      var colors = _getColors();
      return _WIN_DETECT_COLLISION[colors.join("")] || _WIN_DETECT_ACTIVECAPTION[colors[0]] || _WIN_DETECT_GRAYTEXT[colors[1]] || this.defaultTheme;
    },

    "@NT(6\\.1|[7-9])": { // Windows 7
      detect: K("aero/7")
    },

    "@Chrome|Arora": {
      detect: function() {
        var theme = this.base();
        return !theme || theme == "classic" ? this.defaultTheme : theme;
      }
    }
  },
  
  "@Linux": {
    detect: function() {
      return _LINUX_DETECT_ACTIVECAPTION[_getColors()[0]];
    }
  },

  "@Webkit([1-4]|5[01]|52[^89])|Camino|Mac": {
    detect: K("aqua"),

    "@(Chrome|Arora).+win": {
      detect: K("luna/blue")
    }
  }
});

var _WIN_DETECT_ACTIVECAPTION = {
  "#0054e3": "luna/blue",
  "#8ba169": "luna/olive",
  "#c0c0c0": "luna/silver",
  "#335ea8": "royale",
  "#5e81bc": "royale",
  "#99b4d1": "aero",
  "#c4cbde": "aero",
  "#343434": "zune"
}, _WIN_DETECT_GRAYTEXT = {
  "#808080": "classic",
  "#8d8961": "classic/brick",
  "#a28d68": "classic/desert",
  "#588078": "classic/eggplant",
  "#5a4eb1": "classic/lilac",
  "#489088": "classic/marine",
  "#c6a646": "classic/maple",
  "#786058": "classic/plum",
  "#d7a52f": "classic/pumpkin",
  "#4f657d": "classic/rainyday",
  "#9f6070": "classic/rose",
  "#558097": "classic/slate",
  "#559764": "classic/spruce",
  "#bcbc41": "classic/wheat"
}, _WIN_DETECT_COLLISION = {
  "#0a246a#808080": "classic/standard",
  "#0000ff#00ff00": "classic/contrast/high1",
  "#00ffff#00ff00": "classic/contrast/high2",
  "#800080#00ff00": "classic/contrast/black",
  "#000000#00ff00": "classic/contrast/white"
}, _LINUX_DETECT_ACTIVECAPTION = {
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

function _getColors() {
  var element = document.createElement("input"),
      style = element.style,
      body = document.body || behavior.querySelector("head");
  var getColor = function(color) {
        style.color = color;
        if (color.toLowerCase() == style.color.toLowerCase()) {
          color = ViewCSS.getComputedPropertyValue(document.defaultView, element, "color");
        } else {
          color = style.color;
        }
        if (/rgb/.test(color)) color = eval(color);
        return color;
      };
  body.appendChild(element);
  // detect OS theme by inspecting the ActiveCaption colour
  var colors = [getColor("ActiveCaption"), getColor("GrayText")];
  body.removeChild(element);
  return colors;
};
