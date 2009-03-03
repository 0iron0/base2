
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

  ".jsb-dropdown,.jsb-combobox,.jsb-colorpicker": {
    "@theme=aqua": { // aqua
      width:              "10em",
      $boxSizing:         "border-box",
      minHeight:          "15px!",
      maxHeight:          "21px!",
      $borderRadius:      "5px",
      $borderImage:       "url(%theme%/menubutton.png) 2 23 1 6",
      $boxShadow:         "0 1px 0 rgba(160, 160, 160, 0.5)",
      borderStyle:        "none",
      borderWidth:        "2px 23px 1px 6px",
      padding:            "1px"
    },

    "@!theme=aqua": { // not aqua
      width:              "8em",
      paddingRight:       "19px!",
      backgroundImage:    "url(%theme%/menulist.png)!",
      font:               "-webkit-small-control"
    }
  },
  
  ".jsb-progressbar,.jsb-slider,.jsb-colorpicker": {
    textIndent:           "-10em", // hide text for purely visual controls (Safari & Gecko)
    cursor:               "default",
    $userSelect:          "none",

    "@MSIE": {
      verticalAlign:      "top",
      textIndent:         0,
      lineHeight:         "80em" // hide text for purely visual controls (MSIE)
    }
  },
  
  ".jsb-progressbar": {
    padding:               "1px",
    border:                "2px solid ThreeDDarkShadow",
    $borderRadius:         "5px",
    MozBorderTopColors:    "ThreeDDarkShadow ThreeDHighlight",
    MozBorderRightColors:  "ThreeDDarkShadow ThreeDHighlight",
    MozBorderLeftColors:   "ThreeDDarkShadow ThreeDHighlight",
    MozBorderBottomColors: "ThreeDDarkShadow ThreeDHighlight",
    backgroundImage:       "url(%theme%/progressbar.png)!",
    width:                 "164px",

    "@theme=aqua": {
      $borderRadius:       "5px"
    }
  },

  ".jsb-slider": {
    _height:         "22px",
    minHeight:       "22px",
    verticalAlign:   "middle",
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

  ".jsb-colorpicker": {
    width:         "4em"
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
      borderColor:      "black",
      borderStyle:      "outset!",

      "@Gecko": {
        borderLeftWidth: "2px"
      },

      "@Opera": {
        borderStyle:  "solid!"
      }
    }
  },

  ".jsb-spinner": {
    textAlign:        "right",
    width:            "5em",
    paddingRight:     "19px!",
    backgroundImage:  "url(%theme%/spinner.png)!"
  },

  ".jsb-error": {
    borderColor:      "#ff5e5e",
    outlineColor:     "#ff5e5e"
  }
});

jsb.theme.cssText += jsb.createStyleSheet({
  "@theme=aqua": {
    color:            "black",
    $opacity:         0.5,

    ".dropdown_active": {
      $borderImage:   "url(%theme%/menubutton-active.png) 2 23 1 6"
    },

    ".jsb-combobox[readonly],.jsb-combobox[disabled],.jsb-colorpicker[readonly],.jsb-colorpicker[disabled]": {
      $borderImage:   "url(%theme%/menubutton-disabled.png) 2 23 1 6 !",
      $boxShadow:     "none"
    }
  },

  "@!Webkit": {
    ".progressbar_focus,.slider_focus": {
      outline:        "1px dotted",
      MozOutline:     "1px dotted"
    }
  },

  ".jsb-popup *": {
    $boxSizing:       "border-box"
  },

  ".jsb-menulist": {
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

  ".jsb-colorpicker-popup input": {
    fontSize:    "11px",
    margin:      "4px 2px",
    width:       "127px"
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
