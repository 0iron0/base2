
var _baseRule = extend({}, {
  padding:                 "1px 2px 2px 1px",
  borderWidth:             "2px 1px 1px 2px",
  borderStyle:             "solid",
  borderColor:             "#444 #ddd #ddd #444",
  backgroundPosition:      "9999px 9999px",
  backgroundAttachment:    "scroll!important",
  backgroundRepeat:        "no-repeat!important",

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
    }).join("\n");
  }
};

var styleSheet = {
  combobox: {
    paddingRight:    "19px!important",
    width:           "8em",
    backgroundImage: "url(%1menulist.png)!important",

    "@Safari.+theme=aqua": {
        WebkitAppearance: "menulist!important",
        background:       "initial",
        border:           "initial",
        padding:          "initial"
    }
  },
  
  "progressbar,slider": {
    textIndent:        "-10em", // hide text for purely visual controls (Safari & Gecko)
    cursor:            "default",
    WebkitUserSelect:  "none",

    "@MSIE": {
      textIndent: 0,
      lineHeight: "80em" // hide text for purely visual controls (MSIE)
    }
  },
  
  progressbar: {
    padding:               "1px",
    border:                "2px solid ThreeDDarkShadow",
    WebkitBorderRadius:    "2px",
    MozBorderRadius:       "2px",
    MozBorderTopColors:    "ThreeDDarkShadow ThreeDHighlight",
    MozBorderRightColors:  "ThreeDDarkShadow ThreeDHighlight",
    MozBorderLeftColors:   "ThreeDDarkShadow ThreeDHighlight",
    MozBorderBottomColors: "ThreeDDarkShadow ThreeDHighlight",
    backgroundImage:       "url(%1progressbar.png)!important"
  },

  slider: {
    minHeight:       "16px",
    padding:         "3px",
    border:          0,
    backgroundColor: "transparent",
    backgroundImage: "url(%1slider.png)!important",

    "@Safari.+theme=aqua": {
      outline:       "none!important"
    },

    "@Gecko": {
      MozBorder:     "initial"
    }
  },

  "progressbar_focus,slider_focus": {
    outline:    "none",
    MozOutline: "1px dotted"
  },
  
  popup: {
    display:     "none",
    borderWidth: "1px",
    position:    "absolute!important",
    zIndex:      "999999!important",
    cursor:      "default!important",
    padding:     "0!important",
    margin:      "0!important",

    "!@theme=(luna|royale)": {
      borderColor: "red"
    },

    "@Gecko|opera": {
      MozBorder:   "initial",
      borderColor: "black",
      borderStyle: "outset!important"
    }
  },
  
  spinner: {
    textAlign:        "right",
    width:            "5em",
    paddingRight:     "19px!important",
    backgroundImage:  "url(%1spinner.png)!important"
  },
  
  "@WebKit|opera": {
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
    if (/^[\w-]+$/.test(selector)) {
      selector = "." + selector;
    }
    var rule = css[selector];
    if (!rule) rule = css[selector] = extend({toString: _baseRule_toString}, _baseRule);
    forEach.detect (properties, function(value, propertyName) {
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
    })
  }
});

new Theme(chrome.theme);
