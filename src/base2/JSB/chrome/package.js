
// Browser chrome.

// Credits: large parts of this code were written by Erik Arvidsson.

var chrome = new base2.Package(this, {
  parent:  base2.JSB,
  name:    "chrome",
  version: "0.2",
  imports: "Function2,DOM,JSB",
  exports: "Chrome,ComboBox,ProgressBar,Slider,Spinner,Rect"
});

eval(this.imports);
