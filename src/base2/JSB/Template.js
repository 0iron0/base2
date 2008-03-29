
var Template = Behavior.extend({

  /* EVENT HANDLERS */

  onattach: function(element){},
  ondetach: function(element){},

  oncontentready:  function(element, event){},
  ondocumentready: function(element, event){},

  onclick:     function(element, event, offsetX, offsetY, screenX, screenY){},
  ondblclick:  function(element, event, offsetX, offsetY, screenX, screenY){},
  onmousedown: function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseup:   function(element, event, offsetX, offsetY, screenX, screenY){},
  onmousemove: function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseover: function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseout:  function(element, event, offsetX, offsetY, screenX, screenY){},
  
  onmousewheel: function(element, event, delta){},
  
  // ExtendedMouse
  // on((dbl)?click|mouse(up|down)): function(element, event, button, offsetX, offsetY, screenX, screenY)

  onkeydown: function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  onkeyup:   function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  
  onfocus: function(element, event){},
  onblur:  function(element, event){},
  
  /* METHODS */
  
  // methods defined here will be added to any attached element

  instanceMethod1: function(element, param1, param2){},
  
  instanceMethod2: function(element, param1) {
    // because instanceMethod1 is defined in the "instance" namespace so we can call
    // it as a method of the element:
    element.instanceMethod1(param1, "data"); // no need to pass the element
    
    // we can also call instanceMethod1 as a behavior method:
    this.instanceMethod1(element, param1, "data"); // this time we must pass the element
    
    // staticMethod1 is defined on the static interface so we *must* call it
    // as a method of the behavior:
    this.staticMethod1(element, param1, "data");
  },
  
  /* ATTRIBUTES */

  // attributes defined here will be added to any attached element
  sampleAttribute: "value"
}, {
  /* PRE-DEFINED BEHAVIOR METHODS */
  
  // You do not need to define these, they are already defined on the Behavior
  // module and will be inherited by all Behaviors. You may override them if
  // you wish.
  
  attach: function(element){return element;},
  detach: function(element){return element;},

  handleEvent:   function(element, event, type){return undefined;},

  addEventListener:    function(target, type, listener, useCapture){return undefined;},
  removeEventListener: function(target, type, listener, useCapture){return undefined;},
  
  dispatchEvent: function(target, event|type, /* optional */ eventProperties){return Boolean;},

  compareDocumentPosition: function(node1, node2){return Number;},

  hasAttribute:    function(element, name){return Boolean;},
  getAttribute:    function(element, name){return String || null;},
  setAttribute:    function(element, name, value){return undefined;},
  removeAttribute: function(element, name){return undefined;},

  hasClass:    function(element, className){return Boolean;},
  addClass:    function(element, className){return undefined;},
  removeClass: function(element, className){return undefined;},
  toggleClass: function(element, className){return undefined;},

  querySelector:    function(context, selector){return Object;}, // return Element
  querySelectorAll: function(context, selector){return Object;}, // return StaticNodeList

  getComputedStyle: function(element, /* optional */ propertyName){return Object || String;},

  getCSSProperty: function(element, propertyName){return String;},
  setCSSProperty: function(element, propertyName, value, /* optional */ important){return undefined;},
  
  /* USER DEFINED METHODS */
  
  staticMethod1: function(element, param1, param2){},

  /* OVERRIDE EXISTING BEHAVIOR METHODS */
  
  setCSSProperty: function(element, propertyName, value) {
    if (propertyName == "opacity") {
      // do something different
      
      // opacity is supported by base2.DOM, this is just an example
    } else {
      // use the default behavior
      this.base(element, propertyName, value);
    }
  }
});
