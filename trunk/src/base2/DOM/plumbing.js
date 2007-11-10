
// avoid memory leaks

if (detect("MSIE[56].+win") && !detect("SV1")) {
  var closures = {}; // all closures stored here
  
  extend(base2, "bind", function(method, element) {
    if (!element || element.nodeType != 1) {
      return this.base(method, element);
    }
    
    // unique id's for element and function
    var elementID = element.uniqueID;
    var methodID = assignID(method);
    
    // store the closure in a manageable scope
    closures[methodID] = method;
    
    // reset pointers
    method = null;
    element = null;
    
    if (!closures[elementID]) closures[elementID] = {};
    var closure = closures[elementID][methodID];
    if (closure) return closure; // already stored
    
    var bound = function() {
      var element = document.all[elementID];
      return element ? closures[methodID].apply(element, arguments) : undefined;
    };
    bound._cloneID = methodID;
    closures[elementID][methodID] = bound;
    
    return bound;
  });
  
  attachEvent("onunload", function() {
    closures = null; // closures are destroyed when the page is unloaded
  });
}
