function $(id) {
  var res=document.getElementById(id);
  if(res==null) console.log("Element with id '%s' is not found",id);
  return res;
}
//Don't know how to inherit from Error, so use as:
//  throw newError("Error number %1.",1)
function newError(msg/*, format1, ..., format9*/) {
  return new Error(format.apply(null,arguments));
}
function fnbind(object, fn) {
  return function() {
    return fn.apply(object,arguments);
  }
}

if(!console) var console={};
if(!console.log) {
  var __log__=[];
  console.log=function(s) { 
    if(__log__.length==0&&window.attachEvent) {
      top.defaultStatus+=" [press Ctrl+\\ for logging]";
    }
    __log__.push(s); 
  }
  if(window.attachEvent) { //IE
    window.attachEvent("onload",function() {
      document.body.attachEvent('onkeypress',function() {
        if(event.keyCode==28) { //control-backslash
          if(confirm(__log__.join("\n")+"\n\nEmpy log?"))
            __log__=[];
        }
      });
    });
  }
}