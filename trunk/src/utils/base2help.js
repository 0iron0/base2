/*
 * base2help.js - (c) 2007 Doeke Zanstra
 *
 * A little help function for the base library. Usage:
 *   alert(help(base2.DOM))     //for help on the namespace base2.DOM
 *   alert(help(base2.Array2))  //for help on the class Array2
 *
 * Every object (namespace, class, function) can be marked-up with
 * extra info by adding the $help property to it. For example:
 *   base2.Array2.$help="Lot's of nice array functions";
 *
 * Of course, it's best to do this in the library itself.
 */
var help = function(o, m) {
  function inlist(list,word) { return (","+list+",").indexOf(","+word+",")!=-1}
  function isExport(functionName) {
    return o.exports&&inlist(o.exports,functionName);
  }
  if(o===null) {
    return "[null]";
  }
  else if(typeof o=='object'&&m===undefined) { //namespace
    //namespace
    var ignore="base,exports,imports,namespace,version"; if(o.name) ignore+=","+o.name;
    var namespaces=[];
    var classes=[];
    var functions=[];
    forEach(o, function(item, key) {
      if(!inlist(ignore,key)) {
        if(typeof item=='object') namespaces.push(key);
        else if(typeof item=='function') {
          (/^[a-z]/.test(key)?functions:classes).push(key);
        }
      }
    });
    return [format("%1: %2", o.name, o)
           ,"--[namespaces]-------"+namespaces.sort().join(", ")
           ,"--[classes]----------"+classes.sort().join(", ")
           ,"--[functions]--------"+functions.sort().join(", ")
           ].join("\n");
  }
  else if(typeof o=='object'||                     //namespace+function
         (typeof o=='function'&&m!==undefined)) { //class+method
    var f;
    if(typeof m=='string') f=o[m];
    else if(typeof m=='function') forEach(o,function(item, key) { if(m==item) { f=m; m=key; } });
    else throw new Error("2nd argument should be a string or function")
    if(f) return format("%1: %2", m, f.$help?f.$help:"");
    else throw new Error("2nd argument should be a function on the 1st argument");
  }
  else if(typeof o=='function') { //function or class
    //Can't determine between class and function, because name
    //of the object, or parent of the object is not known.
    var a=['','--------------'];
    forEach(o, function(item, key) {
      a.push(key)
    });
    return o.$help?o.$help:""+a.join('\n');
  }
  else { //value type
    return format("%1 (%2)", o, typeof o)
  }
}