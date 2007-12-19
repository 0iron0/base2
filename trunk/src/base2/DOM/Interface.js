
// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
  implement: function(_interface) {
    var module = this;
    if (Interface.ancestorOf(_interface)) {
      forEach (_interface, function(property, name) {
        if (_interface[name]._delegate) {
          module[name] = function() { // Late binding.
            return _interface[name].apply(_interface, arguments);
          };
        }
      });
    } else if (typeof _interface == "object") {
      this.forEach (_interface, function(source, name) {
        if (name.charAt(0) == "@") {
          forEach (source, arguments.callee);
        } else if (typeof source == "function" && source.call) {
          // delegate a static method to the bound object
          //  e.g. for most browsers:
          //    EventTarget.addEventListener(element, type, listener, capture) 
          //  forwards to:
          //    element.addEventListener(type, listener, capture)
          if (!module[name]) {
            var FN = "var fn=function _%1(%2){%3.base=%3.%1.ancestor;var m=%3.base?'base':'%1';return %3[m](%4)}";
            var args = "abcdefghij".split("").slice(-source.length);
            eval(format(FN, name, args, args[0], args.slice(1)));
            fn._delegate = name;
            module[name] = fn;
          }
        }
      });
    }
    return this.base(_interface);
  }
});
