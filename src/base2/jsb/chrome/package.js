
// Browser chrome.

// Credits: some code written by Erik Arvidsson.

base2.global.chrome = new base2.Package(this, {
  name:    "chrome",
  version: "0.5",
  imports: "Enumerable,Function2,DOM,jsb",
  exports: "Popup,MenuList,ToolTip,dropdown,combobox,number,range,progressbar,slider,spinner,datepicker,weekpicker,colorpicker",
  parent:  base2.jsb
});

eval(this.imports);

;;; chrome.host = "http://rekky.rosso.name/base2/trunk/src/base2/jsb/chrome/";

/*if (detect("MSIE6")) {
  try {
    document.execCommand("BackgroundImageCache", false, true);
  } catch (ex) {}
}*/
