
base2.global.html5 = new base2.Package(this, {
  name:    "html5",
  version: "0.1",
  imports: "Function2,DOM,jsb",
  exports: "element,template",
  
  "@MSIE": {
    init: function() {
      var newElements =
        "abbr,article,aside,audio,bb,canvas,datagrid,datalist,details,dialog,eventsource," +
        "figure,footer,header,mark,menu,meter,nav,output,progress,section,time,video";
      forEach.csv(newElements, bind("createElement", document));
    }
  }
});

eval(this.imports);
