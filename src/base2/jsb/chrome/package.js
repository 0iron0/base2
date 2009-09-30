
// Browser chrome.

// Credits: some code written by Erik Arvidsson.

base2.global.chrome = new base2.Package(this, {
  name:    "chrome",
  version: "0.9.1",
  imports: "Enumerable,Function2,dom,jsb",
  exports: // public components
           "combobox,progressbar,slider,spinner,colorpicker," +
           "datepicker,weekpicker,monthpicker,timepicker," +
           // these are for extensibility
           "Popup,PopupWindow,MenuList,ToolTip,dropdown",
           
  parent:  base2.jsb,
  
  getBehavior: function(element) {
    return _attachments[element.uniqueID] || null;
  }
});

eval(this.imports);
