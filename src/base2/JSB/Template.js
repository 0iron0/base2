
var Template = Behavior.extend({

  /* EVENT HANDLERS */

  onattach: function(element){},
  ondetach: function(element){},

  oncontentready:  function(element, event){}, // not implemented
  ondocumentready: function(element, event){},

  onclick:      function(element, event, offsetX, offsetY, screenX, screenY){},
  ondblclick:   function(element, event, offsetX, offsetY, screenX, screenY){},
  onmousedown:  function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseup:    function(element, event, offsetX, offsetY, screenX, screenY){},
  onmousemove:  function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseover:  function(element, event, offsetX, offsetY, screenX, screenY){},
  onmouseout:   function(element, event, offsetX, offsetY, screenX, screenY){},
  
  onmousewheel: function(element, event, delta){},
  
  // ExtendedMouse
  // on((dbl)?click|mouse(up|down)): function(element, event, button, offsetX, offsetY, screenX, screenY)

  onkeydown:  function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  onkeyup:    function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  
  onkeypress: function(element, event, charCode){}, // not tested
  
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

  // attributes defined here willbe added to any attached element
  sampleAttribute: "value"
}, {
  /* PRE-DEFINED BEHAVIOR METHODS */
  
  // You do not need to define these, they are already defined on the Behavior
  // module and will be inherited by any all Behaviors. You may override them
  // if you wish. Otherwise they are just here for illustration.
  
  attach: function(element){},
  detach: function(element){},

  handleEvent:      function(element, event, type){},
  handleKeyEvent:   function(element, event, type){},
  handleMouseEvent: function(element, event, type){},

  addEventListener:    function(target, type, listener, useCapture){},
  removeEventListener: function(target, type, listener, useCapture){},
  
  dispatchEvent: function(target, event|type){},

  compareDocumentPosition: function(node1, node2){},

  hasAttribute:    function(element, name){},
  getAttribute:    function(element, name){},
  setAttribute:    function(element, name, value){},
  removeAttribute: function(element, name){},

  hasClass:    function(element, className){},
  addClass:    function(element, className){},
  removeClass: function(element, className){},
  toggleClass: function(element, className){},

  querySelector:    function(context, selector){},
  querySelectorAll: function(context, selector){},

  getComputedStyle: function(element, /* optional */ propertyName){},

  getCSSProperty: function(element, propertyName){},
  setCSSProperty: function(element, propertyName, value, /* optional */ important){},
  
  /* USER DEFINED METHODS */
  
  staticMethod1: function(element, param1, param2){},

  /* OVERRIDE EXISTING BEHAVIOR METHODS */
  
  setCSSProperty: function(element, propertyName, value) {
    if (propertyName == "opacity") {
      // do something different
    } else {
      // use the default behavior
      this.base(element, propertyName, value);
    }
  }
});
