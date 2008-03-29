
// Browser chrome.

// Credits: large parts of this code were written by Erik Arvidsson.

var chrome = new base2.Package(this, {
  parent:  base2.JSB,
  name:    "chrome",
  version: "0.2",
  imports: "Enumerable,Function2,DOM,JSB",
  exports: "Chrome,ComboBox,Range,ProgressBar,Slider,Spinner,Rect",
  
  host:    "http://base2.googlecode.com/svn/trunk/src/base2/JSB/chrome/"
});

eval(this.imports);
