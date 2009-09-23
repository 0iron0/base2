
var _SUPPORTS_BORDER_BOX = detect("QuirksMode") || detect("(style.boxSizing)");
    
var _HOST = Array2.item(document.getElementsByTagName("script"), -1).src;
;;; _HOST = _HOST.replace(/build\.php\?package=([\w\/]+)package\.xml.*$/, "$1");
_HOST = _HOST.replace(/[\?#].*$/, "").replace(/[^\/]*$/, "");
    
var _BLOCK_START = /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|CANVAS|DETAILS|DIALOG|DIV|DL|FIGURE|FOOTER|FORM|H[1-6]|HEADER|MENU|NAV|OL|P|SECTION|TABLE|UL|VIDEO)$/;

var _styleSheet = {
  "[hidden],[repeat=template]": {
    display: "none!"
  }
};
