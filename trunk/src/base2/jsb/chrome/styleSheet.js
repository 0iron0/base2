
var _HIGHLIGHT =      "Highlight",
    _HIGHLIGHT_TEXT = "HighlightText";

if (detect("Webkit([1-4]|5[01]|52[^89])|theme=aqua")) { // webkit pre 528 uses the same colours, no matter the theme
    _HIGHLIGHT =      "#427cd9";
    _HIGHLIGHT_TEXT = "white";
}

jsb.theme.cssText = jsb.createStyleSheet({
  "*": {
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
  },

  ".jsb-dropdown,.jsb-combobox,.jsb-colorpicker,.jsb-datepicker,.jsb-weekpicker": {
    "@theme=aqua": { // aqua
      width:              "10em",
      BoxSizing:          "border-box",
      BorderRadius:       "5px",
      BorderImage:        "url(%theme%/menubutton.png) 2 23 1 6",
      BoxShadow:          "0 1px 0 rgba(160, 160, 160, 0.5)",
      borderStyle:        "none",
      borderWidth:        "2px 23px 1px 6px!",
      padding:            "1px",
      
      "@(style.MozBorderImage===undefined&&style.WebkitBorderImage===undefined)": {
        backgroundImage:        "url(%theme%/dropdown.png)!",
        backgroundPosition:     "right center!",
        padding:                "1px 23px 1px 4px!",
        border:                 "1px solid #545454!"
      },
      
      "@Webkit": {
        fontSize:               "0.67em"
      }
    },

    "@!theme=aqua": { // not aqua
      width:              "8em",
      paddingRight:       "19px!",
      backgroundImage:    "url(%theme%/menulist.png)!"
    }
  },

  ".jsb-progressbar,.jsb-slider,.jsb-colorpicker": {
    textIndent:           "-10em", // hide text for purely visual controls (Safari & Gecko)
    cursor:               "default",
    UserModify:           "read-only",
    UserSelect:           "none",

    "@MSIE": {
      verticalAlign:      "top",
      textIndent:         0,
      lineHeight:         "80em" // hide text for purely visual controls (MSIE)
    }
  },

  ".jsb-progressbar": {
    padding:               "1px",
    border:                "2px solid ThreeDDarkShadow",
    BorderRadius:          "5px",
    MozBorderTopColors:    "ThreeDDarkShadow ThreeDHighlight",
    MozBorderRightColors:  "ThreeDDarkShadow ThreeDHighlight",
    MozBorderLeftColors:   "ThreeDDarkShadow ThreeDHighlight",
    MozBorderBottomColors: "ThreeDDarkShadow ThreeDHighlight",
    backgroundImage:       "url(%theme%/progressbar.png)!",
    width:                 "164px",

    "@theme=aqua": {
      BorderRadius:        "5px"
    }
  },

  ".jsb-slider": {
    _height:         "22px",
    minHeight:       "22px",
    padding:         "0",
    border:          0,
    backgroundColor: "transparent",
    backgroundImage: "url(%theme%/slider.png)!",

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

  ".jsb-popup": {
    visibility:  "hidden",
    borderWidth: "1px",
    position:    "absolute!",
    zIndex:      "999999!",
    cursor:      "default",
    padding:     "0",
    margin:      "0!",

    "@Gecko|Opera|theme=aqua|Webkit": {
      MozBorder:        "initial",
      borderColor:      "black!",
      borderStyle:      "outset!",

      "@Opera": {
        borderStyle:    "solid!"
      }
    },

    "@theme=classic": {
      borderColor:      "black!",
      borderStyle:      "solid!"
    }
  },

  ".jsb-spinner": {
    textAlign:        "right",
    width:            "5em",
    paddingRight:     "19px!",
    backgroundImage:  "url(%theme%/spinner.png)!"
  },

  ".jsb-spinner[disabled],.jsb-spinner[readonly]": {
    borderColor:      "#d6d6d6 #e0e0e0 #f0f0f0 #e0e0e0"
  },

  ".jsb-datepicker-popup table": {
    backgroundColor: "Window!",
    color:           "WindowText!",
    width:           "100%!",
    margin:          "4px 0!",
    UserSelect:      "none!",
  }
});

jsb.theme.cssText += jsb.createStyleSheet({
  ".jsb-error": {
    borderColor:      "#ff5e5e",
    outlineColor:     "#ff5e5e"
  },
  
  ".jsb-colorpicker": {
    width:         "4em"
  },

  ".jsb-datepicker.,jsb-weekpicker": {
    width:         "12ex"
  },

  "@!Webkit": {
    ".progressbar_focus,.slider_focus,.colorpicker_focus": {
      Outline:        "1px dotted"
    }
  },

  ".jsb-popup *": {
    BoxSizing:       "border-box"
  },

  ".jsb-datalist": {
    display:         "none!"
  },

  ".jsb-menulist": {
    "@!MSIE": {
      overflow:      "auto!"
    },

    "@MSIE": {
      overflowY:      "auto!"
    }
  },

  ".jsb-menulist p": {
    margin:          "0!",
    padding:         "1px 2px!",
    overflow:        "hidden!",
    whiteSpace:      "nowrap!"
  },

  ".jsb-colorpicker-popup": {
    backgroundColor: "ButtonFace!",
    color:           "ButtonText!",
    fontSize:        "11px!",
    padding:         "4px!",
    overflow:        "hidden!",
    whiteSpace:      "nowrap!",
    color:           "black!",

    "@Webkit([1-4]|5[01]|52[^89])": {
      backgroundColor: "#ece9d8!"
    }
  },

  ".jsb-colorpicker-popup input": {
    fontSize:    "11px",
    margin:      "4px 2px",
    width:       "127px"
  },

  ".jsb-datepicker-popup": {
    backgroundColor: "#fcfcfd!",
    overflow:        "hidden!",
    padding: "4px"
  },

  ".jsb-datepicker-popup table:focus": {
    Outline:         "none",
    borderColor:     _HIGHLIGHT + "!"
  },

  ".jsb-datepicker-popup input": {
    backgroundColor: "Window",
    padding:         "1px 2px",
    color:           "WindowText"
  },

  ".jsb-datepicker-popup th": {
    backgroundColor: "InfoBackground!",
    color:           "InfoText!",
    fontWeight:      "normal!",
    borderBottom:    "10px solid white"
  },

  ".jsb-datepicker-popup th,.jsb-datepicker-popup td": {
    padding:         "2px 0!",
    textAlign:       "center!",
    width:           "14%!"
  },

  ".jsb-datepicker-popup td.disabled": {
    color:           "#ccc!"
  },

  ".jsb-datepicker-popup td.selected,.jsb-datepicker-popup tr.selected td": {
    backgroundColor: _HIGHLIGHT,
    color:           _HIGHLIGHT_TEXT
  },

  "@theme=luna\\/blue": {
    ".jsb-datepicker-popup th": {
      backgroundColor: "#ffffe1!"
    }
  },

  "@!MSIE": {
    ".jsb-datepicker-popup select": {
      "float": "left"
    },

    ".jsb-datepicker-popup input": {
      "float": "right"
    }
  },

  "@theme=aqua": {
    ".jsb-menulist": {
      Opacity:            0.95
    },

    ".jsb-spinner": {
      paddingRight:          "15px!"
    },

    ".jsb-colorpicker": {
      BorderImage:        "url(%theme%/colorpicker.png) 2 23 1 6",
      width:              "6em"
    },

    ".jsb-datepicker,.jsb-weekpicker": {
      width:         "8em"
    },

    ".jsb-datepicker-popup table": {
      backgroundColor:       "white!"
    },

    ".jsb-datepicker-popup th": {
      backgroundColor: "#89acd5!",
      color:           "white!"
    },

    ".dropdown_active,.combobox_active,.datepicker_active,.weekpicker_active,.colorpicker_active": {
      BorderImage:   "url(%theme%/menubutton-active.png) 2 23 1 6"
    },

    ".jsb-combobox[readonly],.jsb-combobox[disabled],.jsb-datepicker[readonly],.jsb-datepicker[disabled],.jsb-weekpicker[readonly],.jsb-weekpicker[disabled]": {
      BorderImage:   "url(%theme%/menubutton-disabled.png) 2 23 1 6 !",
      BoxShadow:     "none"
    },

    ".jsb-combobox[disabled],.jsb-datepicker[disabled],.jsb-weekpicker[disabled],.jsb-colorpicker[disabled],.jsb-progressbar[disabled]": {
      color:         "black",
      Opacity:       0.5
    },

    ".jsb-colorpicker[readonly],.jsb-colorpicker[disabled]": {
      BorderImage:   "url(%theme%/colorpicker-disabled.png) 2 23 1 6 !",
      BoxShadow:     "none"
    },

    ".jsb-colorpicker-popup,.jsb-datepicker-popup": {
      backgroundColor: "white!",
      backgroundImage: "url(%theme%/metal.png)!",
      backgroundRepeat: "repeat!"
    }
  },

  "@WebKit|Opera": {
    "input[type=range]": {
      background: "initial",
      height:     "initial",
      padding:    "initial",
      border:     "initial"
    }
  }
});
