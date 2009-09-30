
var _WINDOW =         "window",
    _HIGHLIGHT =      "highlight",
    _HIGHLIGHT_TEXT = "highlighttext";

if (detect("(Webkit([1-4]|5[01]|52[^89])|theme=aqua).+win")) { // webkit pre 528 uses the same colours, no matter the theme
    _WINDOW =         "#ffffff";
    _HIGHLIGHT =      "#427cd9";
    _HIGHLIGHT_TEXT = "#ffffff";
}
