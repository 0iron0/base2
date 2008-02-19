
// The Interface module is the base module for defining DOM interfaces.
// Interfaces are defined with reference to the original W3C IDL.
// e.g. http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Interface = Module.extend(null, {
  forEach: function(block, context) {
    forEach (this, function(method, name) {
      if (typeOf(method) == "function" && (this.prototype[name] || method._delegate)) {
        block.call(context, method, name, this);
      }
    }, this, Module);
  },
  
  implement: function(_interface) {
    if (Interface.ancestorOf(_interface)) {
      forEach (_interface, function(property, name) {
        if (_interface[name]._delegate) {
          this[name] = bind(name, _interface);
          this[name]._delegate = name;
        }
      }, this, this);
    } else if (typeof _interface == "object") {
      var detected = true;
      forEach (_interface, function(source, name) {
        if (name.charAt(0) == "@") {
          detected = detect(name.slice(1));
          forEach (source, arguments.callee, this, this);
          detected = true;
        } else if (typeOf(source) == "function") {
          // delegate a static method to the bound object
          //  e.g. for most browsers:
          //    EventTarget.addEventListener(element, type, listener, capture) 
          //  forwards to:
          //    element.addEventListener(type, listener, capture)
          if (!this[name]) {
            var FN = "var fn=function _%1(%2){%3.base=%3.%1.ancestor;var m=%3.base?'base':'%1';return %3[m](%4)};";
            var args = "abcdefghij".slice(-source.length).split("");
            eval(FN = format(FN, name, args, args[0], args.slice(1)));
            fn._delegate = name;
            this[name] = fn;
            if (!detected)
              this.namespace += format("var %1=base2.JavaScript.Function2.bind('%1',base2.Module[%2]);", name, this.toString("index"));
          }
        }
      }, this, this);
    }
    return this.base(_interface);
  }
});
