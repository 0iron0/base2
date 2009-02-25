
var template = behavior.extend({
  /* EVENT HANDLERS */

  onattach: function(element){},
  ondetach: function(element){/* not currently supported */},

  oncontentready:  function(element){},
  ondocumentready: function(element){},

  onmouseover: function(element, event){},
  onmouseout:  function(element, event){},

  onclick:     function(element, event, x, y, screenX, screenY){},
  ondblclick:  function(element, event, x, y, screenX, screenY){},
  onmousedown: function(element, event, x, y, screenX, screenY){},
  onmouseup:   function(element, event, x, y, screenX, screenY){},
  onmousemove: function(element, event, x, y, screenX, screenY){},
  
  // ExtendedMouse
  // on((dbl)?click|mouse(up|down)): function(element, event, button, x, y, screenX, screenY)
  
  onmousewheel: function(element, event, delta){},

  onkeydown: function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  onkeyup:   function(element, event, keyCode, shiftKey, ctrlKey, altKey){},
  
  onfocus: function(element, event){},
  onblur:  function(element, event){},
  
  onotherevent: function(element, event){},
  
  /* PRE-DEFINED BEHAVIOR METHODS */
  
  // You do not need to define these, they are already defined on the behavior
  // module and will be inherited by all behaviors. You may override them if
  // you wish.
  
  attach: function(element){return element;},
  detach: function(element){return element;},

  addEventListener:    function(target, type, listener, useCapture){},
  removeEventListener: function(target, type, listener, useCapture){},
  
  dispatchEvent: function(target, event|type, /* optional */ eventProperties){return Boolean;},

  compareDocumentPosition: function(node1, node2){return Number;},

  getBoundingClientRect: function(element){return TextRectangle},
  getOffsetFromBody:     function(element){return Offset},

  hasAttribute:    function(element, name){return Boolean;},
  getAttribute:    function(element, name){return String || null;},
  setAttribute:    function(element, name, value){},
  removeAttribute: function(element, name){},

  hasClass:    function(element, className){return Boolean;},
  addClass:    function(element, className){},
  removeClass: function(element, className){},
  toggleClass: function(element, className){},

  querySelector:    function(context, selector){return Object;}, // return Element
  querySelectorAll: function(context, selector){return Object;}, // return StaticNodeList
  
  matchesSelector: function(element, selector){return Boolean;},

  getComputedStyle: function(element, /* optional */ propertyName){return Object || String;},

  getProperty: function(element, propertyName){return Object;},
  setProperty: function(element, propertyName, value){},

  getCSSProperty: function(element, propertyName){return String;},
  setCSSProperty: function(element, propertyName, value, /* optional */ important){},

  // capture mouse events
  captureMouse: function(element){},
  releaseMouse: function(){},

  // bind a timer function to a behavior object
  setInterval: function(callback, delay, /* optional */ arg1, arg2, argN){return Number;}, // return timer id
  setTimeout:  function(callback, delay, /* optional */ arg1, arg2, argN){return Number;},

  /* USER DEFINED METHODS */

  staticMethod1: function(element, param1, param2){},

  /* OVERRIDE EXISTING BEHAVIOR METHODS */
  
  setCSSProperty: function(element, propertyName, value) {
    if (propertyName == "opacity") {
      // do something different
      
      // NB: opacity is already supported by base2.DOM, this is just an example
    } else {
      // use the default behavior
      this.base(element, propertyName, value);
    }
  }
});
