
// Browser chrome.

// Credits: some code written by Erik Arvidsson.

base2.global.chrome = new base2.Package(this, {
  name:    "chrome",
  version: "0.5",
  imports: "Enumerable,Function2,DOM,jsb",
  exports: "Popup,MenuList,ToolTip,dropdown,combobox,number,range,progressbar,slider,spinner,timepicker,datepicker,weekpicker,monthpicker,colorpicker",
  parent:  base2.jsb
});

eval(this.imports);

EventTarget.addEventListener(document, "textresize", function() {
  Array2.batch(document.getElementsByTagName("input"), function(input,i) {
    var type = input.className.replace(/^.*jsb\-(\w+).*$/, "$1"),
        behavior = chrome[type];
    if (behavior) behavior.layout(input);
  }, 100);
}, false);

/*if (detect("MSIE6")) {
  try {
    document.execCommand("BackgroundImageCache", false, true);
  } catch (ex) {}
}*/
