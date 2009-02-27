
// Browser chrome.

// Credits: some code written by Erik Arvidsson.

base2.global.chrome = new base2.Package(this, {
  parent:  null,
  name:    "chrome",
  version: "0.4",
  imports: "Enumerable,Function2,DOM,jsb",
  exports: "Popup,MenuList,control,dropdown,combobox,number,range,progressbar,slider,spinner,colorpicker",

  //host:    ""
  host:    "http://base2.googlecode.com/svn/trunk/src/base2/jsb/chrome/"
});

;;; chrome.host = "http://rekky.rosso.name/base2/trunk/src/base2/jsb/chrome/";

eval(this.imports);

/*if (detect("MSIE6")) {
  try {
    document.execCommand("BackgroundImageCache", false, true);
  } catch (ex) {}
}*/
