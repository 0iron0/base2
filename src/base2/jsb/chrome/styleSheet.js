
var _border = extend({}, {
  color:               "threedface",

  "@theme=luna\\/blue": {
    color:             "#7f9db9"
  },

  "@theme=luna\\/olive": {
    color:             "#a4b97f"
  },

  "@theme=luna\\/silver": {
    color:             "#a5acb2"
  },

  "@theme=royale": {
    color:             "#a7a6aa"
  },

  "@theme=aero": {
    color:             "#abadb3 #dbdfe6 #e3e9ef #e2e3ea"
  },

  "@theme=zune": {
    color:             "#969696"
  }
});

jsb.theme.cssText = jsb.createStyleSheet({
  "*": {
    backgroundPosition:        "9999px 9999px",
    backgroundAttachment:      "scroll!",
    backgroundRepeat:          "no-repeat!",

    "@!theme=classic": {
      padding:                 "2px",
      border:                  "1px solid",
      borderColor:             _border.color
    },

    "@theme=aqua": {
      padding:                 "1px 2px 2px 2px",
      borderWidth:             "2px 1px 1px 1px",
      borderColor:             "#9e9e9e #b4b4b4 #dadada #b4b4b4"
    }
  },

  ".jsb-dropdown,.jsb-combobox,.jsb-colorpicker,.jsb-datepicker,.jsb-weekpicker": {
    "@theme=aqua": {
      width:                  "10em",
      borderRadius:           "5px",
      boxShadow:              "0 1px 4px rgba(160, 160, 160, 0.5)",

      "@(style.borderImage)": {
        borderImage:          "url(%theme%/dropdown.png) 1 18 1 4!",
        borderStyle:          "none!",
        borderWidth:          "1px 18px 1px 4px!",
        padding:              "1px"
      },

      "@!(style.borderImage)": {
        backgroundImage:      "url(%theme%/bg-dropdown.png)!",
        backgroundPosition:   "right center!",
        padding:              "1px 22px 1px 4px!",
        border:               "1px solid #545454!"
      }
    },

    "@!theme=aqua": {
      paddingRight:           "19px!",
      backgroundImage:        "url(%theme%/dropdown.png)!"
    }
  },

  ".jsb-colorpicker,.jsb-datepicker,.jsb-weekpicker": {
    width:                    "8em"
  },

  ".jsb-progressbar,.jsb-slider,.jsb-colorpicker": {
    cursor:                   "default",
    textIndent:               "-10em!", // hide text for purely visual controls (Gecko, Webkit and Opera)
    userModify:               "read-only!",
    MozUserSelect:            "none!", // still buggy in webkit

    "@MSIE": { // hide text for purely visual controls (MSIE)
      textIndent:         0,

      "@MSIE(5.5|6|7)": {
        lineHeight:       999
      },

      "@MSIE[^567]": {
        lineHeight:       999,
        verticalAlign:    "middle" // Argh! This is bad. It means that the normal vertical alignment doesn't work. :(
      }
    }
  },

  ".jsb-progressbar,.jsb-slider": {
    verticalAlign:        "middle" // not sure about this
  },

  ".jsb-progressbar": {
    minHeight:             "8px",
    borderColor:           "threeddarkshadow",
    borderWidth:           "1px",
    borderRadius:          "5px",
    backgroundImage:       "url(%theme%/progressbar.png)!",

    "@Opera8": {
      backgroundImage:     "url(themes/s/progressbar.png)!"
    }
  },

  ".jsb-slider": {
    height:               "21px",
    minHeight:            "21px",
    padding:              0,
    border:               "none",
    backgroundColor:      "transparent",
    backgroundImage:      "url(%theme%/slider.png)!",

    "@Opera8": {
      backgroundImage:    "url(themes/s/slider.png)!"
    },

    "@Gecko1\\.[0-3]": {
      backgroundColor:    "#f2f2f2"
    }
  },

  ".jsb-popup": {
    visibility:         "hidden",
    backgroundColor:    _WINDOW,
    borderWidth:        "1px!",
    position:           "absolute!",
    zIndex:             "999999!",
    cursor:             "default",
    padding:            "0!",
    margin:             "0!",

    "@Gecko|Opera|theme=aqua|Webkit": {
      borderColor:      "threedshadow!",
      borderStyle:      "outset!",

      "@Opera": {
        borderStyle:    "solid!"
      }
    },

    "@theme=classic": {
      borderColor:      "threedshadow!",
      borderStyle:      "solid!"
    }
  },

  ".jsb-spinner": {
    "@!Opera[78]": {
      textAlign:        "right"
    },
    width:              "5em",
    paddingRight:       "19px!",
    backgroundImage:    "url(%theme%/spinner.png)!"
  },

  ".jsb-timepicker,.jsb-monthpicker": {
    width:              "8ex",
    paddingRight:       "19px!",
    backgroundImage:    "url(%theme%/spinner.png)!",

    "@QuirksMode|Gecko1\\.[0-3]|Opera8": {
      width:            "6em"
    }
  },

  ".jsb-popup .jsb-datepicker-days": {
    userSelect:         "none!",
    width:              "100%!",
    margin:             "2px 0 0 0!",
    padding:            "2px!",
    backgroundColor:    _WINDOW + "!",
    color:              "windowtext!"
  }
});

jsb.theme.cssText += "\n" + jsb.createStyleSheet({
  ".jsb-popup *": {
    margin: "0!",
    padding: "0!"
  },
  
  ".jsb-popup option": {
    padding: "0 3px!"
  },

  ".jsb-colorpicker": {
    width:         "4em",

    "@QuirksMode|Gecko1\\.[0-3]|Opera8": {
      width:       "6em"
    }
  },

  ".jsb-datepicker": {
    width:         "12ex",

    "@QuirksMode|Gecko1\\.[0-3]|Opera8": {
      width:       "15ex"
    }
  },

  ".jsb-weekpicker": {
    width:         "11ex",

    "@QuirksMode|Gecko1\\.[0-3]|Opera8": {
      width:       "14ex"
    }
  },

  "@Webkit": {
    ".jsb-slider:focus:not(.slider_focus)": {
      outline:        "none!"
    }
  },

  "@!Webkit": {
    ".progressbar_focus,.slider_focus,.colorpicker_focus": {
      outline:        "1px dotted"
    }
  },

  ".jsb-datalist": {
    display:         "none!"
  },

  ".jsb-menulist": {
    "@!MSIE": {
      overflow:      "auto!"
    },

    "@MSIE": {
      overflowY:     "auto!"
    }
  },

  ".jsb-menulist div": {
    margin:          "0!",
    padding:         "1px 2px!",
    overflow:        "hidden!",
    whiteSpace:      "nowrap!"
  },

  ".jsb-colorpicker-popup": {
    backgroundColor:      "buttonface!",
    color:                "buttontext!",
    fontSize:             "11px!",
    padding:              "4px!",
    overflow:             "hidden!",
    whiteSpace:           "nowrap!",
    userSelect:           "none!",

    "@Webkit([1-4]|5[01]|52[^89])|Chrome": {
      backgroundColor: "#ece9d8!"
    }
  },

  ".jsb-colorpicker-popup input": {
    fontSize:        "11px",
    margin:          "4px 2px!",
    verticalAlign:   "middle",
    width:           "127px"
  },

  ".jsb-datepicker-popup": {
    backgroundColor:      "#fcfcfd!",
    overflow:             "hidden!",

    "@theme=classic": {
      backgroundColor:      "threedface!"
    }
  },

  ".jsb-datepicker-popup input": {
    width:             "5ex!",
    marginLeft:        "2px!",
    padding:           "2px 19px 2px 2px!",

    "@QuirksMode|Gecko1\\.[0-3]|Opera8": {
      width:           "9ex!"
    },

    "@!MSIE[567]|Opera": {
      padding:         "1px 19px 1px 2px!"
    }
  },

  ".jsb-datepicker-popup th": {
    backgroundColor: "infobackground!",
    color:           "infotext!",
    fontWeight:      "normal!"
  },

  ".jsb-datepicker-popup th,.jsb-datepicker-days td": {
    padding:         "2px 0!",
    textAlign:       "center!",
    width:           "14%!"
  },

  ".jsb-datepicker-days td.disabled,.jsb-datepicker-days tr.disabled td": {
    color:            "graytext!"
  },

  ".jsb-datepicker-days td.selected,.jsb-datepicker-days tr.selected td": {
    backgroundColor: "inactivecaptiontext!",
    color:           "inactivecaption!",
    opacity:         0.5
  },

  ".jsb-datepicker-days_focus td.selected,.jsb-datepicker-days_focus tr.selected td": {
    backgroundColor: _HIGHLIGHT + "!",
    color:           _HIGHLIGHT_TEXT + "!",
    opacity:         1
  },

  "@theme=luna\\/blue": {
    ".jsb-datepicker-popup th": {
      backgroundColor: "#ffffe1!"
    }
  },

  "@theme=(human|clearlooks)": {
    ".jsb-combobox,.jsb-datepicker,.jsb-weekpicker,.jsb-colorpicker": {
      "borderTopRightRadius":          "5px",
      "borderBottomRightRadius":       "5px"
    }
  },

  "@theme=aqua": {
    ".jsb-menulist": {
      opacity:            0.95
    },

    ".jsb-spinner,.jsb-timepicker,.jsb-monthpicker": {
      borderTopWidth:                  "1px",
      paddingTop:                      "2px",
      borderRightColor:                "transparent",
      borderTopRightRadius:            "5px",
      borderBottomRightRadius:         "5px"
    },

    ".jsb-spinner[disabled],.jsb-spinner[readonly],.jsb-timepicker[disabled],.jsb-timepicker[readonly],.jsb-monthpicker[disabled],.jsb-monthpicker[readonly]": {
      borderColor:      "#d6d6d6 #e0e0e0 #f0f0f0 #e0e0e0"
    },

    ".jsb-combobox[readonly],.jsb-combobox[disabled],.jsb-datepicker[readonly],.jsb-datepicker[disabled],.jsb-weekpicker[readonly],.jsb-weekpicker[disabled]": {
      "@(style.borderImage)": {
        borderImage:   "url(%theme%/dropdown-disabled.png) 1 18 1 4!"
      },

      "@!(style.borderImage)": {
        backgroundImage:   "url(%theme%/bg-dropdown-disabled.png)!"
      }
    },

    "@(style.borderImage)": {
      ".jsb-colorpicker": {
        borderImage:       "url(%theme%/colorpicker.png) 1 18 1 4!"
      },

      ".jsb-colorpicker[readonly],.jsb-colorpicker[disabled]": {
        borderImage:       "url(%theme%/colorpicker-disabled.png) 1 18 1 4!"
      }
    },

    "@!(style.borderImage)": {
      ".jsb-colorpicker": {
        backgroundImage:   "url(%theme%/bg-colorpicker.png)!"
      },

      ".jsb-colorpicker[readonly],.jsb-colorpicker[disabled]": {
        backgroundImage:   "url(%theme%/bg-colorpicker-disabled.png)!"
      }
    },

    ".jsb-combobox[disabled],.jsb-datepicker[disabled],.jsb-weekpicker[disabled],.jsb-colorpicker[disabled],.jsb-progressbar[disabled]": {
      color:         "windowtext",
      opacity:       0.5
    },

    ".jsb-colorpicker-popup,.jsb-datepicker-popup": {
      backgroundColor: _WINDOW + "!",
      backgroundImage: "url(%theme%/metal.png)!",
      backgroundRepeat: "repeat!"
    },

    ".jsb-datepicker": {
      width:         "7em"
    },

    ".jsb-weekpicker": {
      width:         "6em"
    },

    ".jsb-monthpicker": {
      width:         "5em"
    },

    ".jsb-datepicker-popup th": {
      backgroundColor: "#89acd5!",
      color:           "white!"
    }
  },

  ".jsb-tooltip": {
    borderColor:        "graytext!",
    backgroundColor:    "infobackground!",
    color:              "infotext!",
    fontSize:           "small!",
    boxShadow:          "2px 4px 4px rgba(160, 160, 160, 0.5)",

    "@MSIE.+QuirksMode": {
      fontSize:         "x-small!"
    }
  },

  ".jsb-tooltip div": {
    padding:            "2px 3px 0 3px!"
  },

  "@(hasFeature('WebForms','2.0'))": {
    "input[list],input[type=number],input[type=date],input[type=time],input[type=month],input[type=week],input[type=range]": {
      backgroundImage:  "none!"
    }
  },

  ".jsb-error": {
    borderColor:      "#ff5e5e",
    outlineColor:     "#ff5e5e"
  },

  "@Safari.+win" : {
    "@!theme=aqua": {
      "input,select": {
        outlineColor:  _border.color,

        "@theme=classic": {
          outlineColor:  "threedface"
        }
      }
    }
  }
});
