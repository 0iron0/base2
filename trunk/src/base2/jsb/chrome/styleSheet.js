
var _baseRule = extend({}, {
  padding:                 "1px 2px 2px 1px",
  borderWidth:             "2px 1px 1px 2px",
  borderStyle:             "solid",
  borderColor:             "#444 #ddd #ddd #444",
  backgroundPosition:      "9999px 9999px",
  backgroundAttachment:    "scroll!",
  backgroundRepeat:        "no-repeat!",

  "@MSIE.+theme=classic": {
    padding:               "1px",
    borderWidth:           "2px",
    borderStyle:           "inset",
    borderColor:           "#fff"
  },

  "@Gecko.+theme=classic": {
    padding:               "1px",
    borderWidth:           "2px",
    MozBorderTopColors:    "ThreeDShadow ThreeDDarkShadow",
    MozBorderRightColors:  "ThreeDHighlight ThreeDLightShadow",
    MozBorderLeftColors:   "ThreeDShadow ThreeDDarkShadow",
    MozBorderBottomColors: "ThreeDHighlight ThreeDLightShadow"
  },

  "@theme=aqua": {
    padding:               "1px 2px 2px 2px",
    borderWidth:           "2px 1px 1px 1px",
    borderColor:           "#9e9e9e #b4b4b4 #dadada #b4b4b4"
  },

  "@theme=(luna|royale)": {
    padding:               "2px",
    borderWidth:           "1px",
    borderStyle:           "solid",
    borderColor:           "#a7a6aa",

    "@luna\\/blue": {
      borderColor:         "#7f9db9"
    },
    "@luna\\/olive": {
      borderColor:         "#a4b97f"
    },
    "@luna\\/silver": {
      borderColor:         "#a5acb2"
    }
  }
});

function _baseRule_toString() {
  return " {\n" +
    map(this, function(value, propertyName) {
      if (typeof value == "function") value = "none";
      return "  " + propertyName.replace(/[A-Z]/g, function(captialLetter) {
        return "-" + captialLetter.toLowerCase();
      }) + ": " + value;
    }).join(";\n") +
  "\n}";
};

var css = {
  toString: function() {
    return map(this, function(properties, selector) {
      return selector + properties;
    }).join("\n").replace(/!/g, "!important");
  }
};

var styleSheet = {
  "default": {},

  "dropdown,combobox,colorpicker": {
    "@theme=aqua": { // aqua
      width:              "10em",
      $boxSizing:         "border-box",
      minHeight:          "15px!",
      maxHeight:          "21px!",
      $borderRadius:      "5px",
      $borderImage:       "url(%1menubutton.png) 2 23 1 6",
      $boxShadow:         "0 1px 0 rgba(160, 160, 160, 0.5)",
      borderStyle:        "none",
      borderWidth:        "2px 23px 1px 6px",
      padding:            "1px"
    },
    
    "@!theme=aqua": { // not aqua
      width:              "8em",
      paddingRight:       "19px!",
      backgroundImage:    "url(%1menulist.png)!",
      font:               "-webkit-small-control"
    }
  },
    
  "@theme=aqua": {
    color:              "black",
    $opacity:           0.5,

    ".dropdown_active": {
      $borderImage:         "url(%1menubutton-active.png) 2 23 1 6"
    },

    ".chrome-combobox[readonly],.chrome-combobox[disabled],.chrome-colorpicker[readonly],.chrome-colorpicker[disabled]": {
      $borderImage:         "url(%1menubutton-disabled.png) 2 23 1 6 !",
      $boxShadow:           "none"
    }
  },
  
  "progressbar,slider,colorpicker": {
    textIndent:           "-10em", // hide text for purely visual controls (Safari & Gecko)
    cursor:               "default",
    $userSelect:          "none",

    "@MSIE": {
      verticalAlign:      "top",
      textIndent:         0,
      lineHeight:         "80em" // hide text for purely visual controls (MSIE)
    }
  },
  
  progressbar: {
    padding:               "1px",
    border:                "2px solid ThreeDDarkShadow",
    $borderRadius:         "5px",
    MozBorderTopColors:    "ThreeDDarkShadow ThreeDHighlight",
    MozBorderRightColors:  "ThreeDDarkShadow ThreeDHighlight",
    MozBorderLeftColors:   "ThreeDDarkShadow ThreeDHighlight",
    MozBorderBottomColors: "ThreeDDarkShadow ThreeDHighlight",
    backgroundImage:       "url(%1progressbar.png)!",
    width:                 "164px",

    "@theme=aqua": {
      $borderRadius:       "5px"
    }
  },

  slider: {
    _height:         "22px",
    minHeight:       "22px",
    verticalAlign:   "middle",
    padding:         "0",
    border:          0,
    backgroundColor: "transparent",
    backgroundImage: "url(%1slider.png)!",

    "@Webkit": {
      outline:       "none!"
    },

    "@Gecko": {
      MozBorder:     "initial"
    },

    "@Gecko1\\.[0-3]": {
      backgroundColor: "#f2f2f2"
    }
  },

  "@!Webkit": {
    ".progressbar_focus,.slider_focus": {
      outline:    "1px dotted",
      MozOutline: "1px dotted"
    }
  },

  colorpicker: {
    width:         "4em"
  },

  datalist: {
    display: "none!"
  },

  popup: {
    visibility:  "hidden",
    borderWidth: "1px",
    position:    "absolute!",
    zIndex:      "999999!",
    cursor:      "default",
    padding:     "0",
    margin:      "0!",

    "@Gecko|Opera|theme=aqua|Webkit": {
      MozBorder:   "initial",
      borderColor: "black",
      borderStyle: "outset!",

      "@Gecko": {
        borderLeftWidth: "2px"
      },

      "@Opera": {
        borderStyle: "solid!"
      }
    }
  },

  ".chrome-popup *": {
    $boxSizing:  "border-box"
  },

  ".chrome-menulist": {
    "@MSIE": {
      overflowY:    "auto!"
    }
  },

  ".chrome-menulist p": {
    margin:      "0!",
    padding:     "1px 2px!",
    overflow:    "hidden!",
    whiteSpace:  "nowrap!"
  },

  ".chrome-colorpicker-popup": {
    color:           "ButtonText!",
    fontSize:        "11px!",
    padding:         "4px!",
    overflow:        "hidden!",
    whiteSpace:      "nowrap!",
    backgroundColor: "ButtonFace!",
    
    "@Webkit([1-4]|5[01]|52[^89])|theme=aqua": {
      color:           "black!",
      backgroundColor: "#ece9d8!"
    }
  },

  ".chrome-colorpicker-popup input": {
    margin:      "4px 2px"
  },

  spinner: {
    textAlign:        "right",
    width:            "5em",
    paddingRight:     "19px!",
    backgroundImage:  "url(%1spinner.png)!"
  },

  error: {
    borderColor: "#ff5e5e",
    outlineColor: "#ff5e5e"
  },
  
  "@WebKit|Opera": {
    "input[type=range]": {
      background: "initial",
      height:     "initial",
      padding:    "initial",
      border:     "initial"
    }
  }
};

forEach.detect (styleSheet, function(properties, selector) {
  if (/,/.test(selector)) {
    forEach.csv(selector, partial(arguments.callee, properties));
  } else {
    var inherit = false;
    if (selector == "default") {
      selector = ".chrome";
      inherit = true;
    } else if (/^[\w-]+[^\s+>]*$/.test(selector)) {
      inherit = true;
      selector = ".chrome-" + selector;
    }
    var rule = css[selector];
    if (!rule) rule = css[selector] = extend({toString: _baseRule_toString}, inherit ? _baseRule : null);
    forEach.detect (properties, function(value, propertyName) {
      if (propertyName.indexOf("$") == 0) {
        propertyName = propertyName.slice(1);
        arguments.callee(value, _PREFIX + propertyName);
      }
      if (value == "initial") {
        forEach (rule, function(initialPropertyValue, initialPropertyName) {
          if (initialPropertyName.indexOf(propertyName) == 0) {
            delete rule[initialPropertyName];
          }
        });
        delete rule[propertyName];
      } else {
        rule[propertyName] = value;
      }
    });
  }
});

var _theme = new Theme(chrome.theme);
//console2.log(_theme.cssText);
