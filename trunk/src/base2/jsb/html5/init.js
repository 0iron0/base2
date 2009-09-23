
forEach.csv("article,section", function(tagName) {
  _registerElement(tagName, {
    detect:  "cite",
    display: "block"
  });
});
  
forEach.csv("aside,dialog,footer,header,hgroup,nav", partial(_registerElement, undefined, "block"));

forEach.csv("datalist,eventsource", partial(_registerElement, undefined, "none"));

_registerElement("abbr");

jsb.createStyleSheet(_styleSheet);
