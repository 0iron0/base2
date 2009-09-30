
_registerElement("abbr");

forEach.csv("article,section", partial(_registerElement, undefined, {
  detect:  "cite",
  display: "block"
}));

forEach.csv("aside,dialog,footer,header,hgroup,nav", partial(_registerElement, undefined, "block"));

_registerElement("figure", {
  display: "block",
  style: {
    margin: "1em 40px"
  }
});

_registerElement("mark", {
  style: {
    background: "yellow"
  }
});

// Create the style sheet.
jsb.createStyleSheet(_styleSheet);

// Cache images.
forEach ([_OPEN_IMAGE, _CLOSED_IMAGE], function(src) {
  (new Image).src = src;
});

// Create the rules.
html5.rules = new jsb.RuleList(_rules);
