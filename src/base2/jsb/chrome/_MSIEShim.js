
// Damn. This is way too big. :-(
// All this because MSIE does not respect padding in <input> elements.

// Basically, this code places a little widget over the current <input> element.
// The little widget looks exactly like the chrome control and forwards its
// events.

// This code nearly works for Opera8. Opera8 suffers the same bug in not respecting
// the padding in the client area of an <input> box. However, we can't rescroll
// the element so it actually makes things worse.

var _MSIEShim = {
  onfocus: function(element) {
    this.base.apply(this, arguments);
    var behavior = this, timer;
    if (!shim.control) {
      shim.control = document.createElement(detect.MSIE5 ? "span" : "x");
      document.body.insertBefore(shim.control, document.body.firstChild);
      shim.attach(shim.control);
    }
    shim.element = element;
    shim.behavior = behavior;
    var style = shim.control.style;
    style.display = "none";
    style.position = "absolute";
    style.fontSize = "0";
    style.border = "0";
    style.height = element.clientHeight + PX;
    style.width = behavior._IMAGE_WIDTH + PX;
    style.backgroundImage = this.getComputedStyle(element, "backgroundImage");
    //style.background = "red";
    shim.layout();
    var blurType = detect.MSIE && !detect.MSIE5 ? "onfocusout" : "onblur",
        inputType = detect.MSIE ? "onpropertychange" : "onkeydown",
        oninput = detect.MSIE ? change : resetScroll;
    _private.attachEvent(element, inputType, oninput);
    _private.attachEvent(element, blurType, onblur);
    
    function change(event) {
      if (event.propertyName == "value") resetScroll();
    };
    function resetScroll() {
      element.scrollLeft = 9999;
    };
    function position() {
      var offset = ElementView.getOffsetFromBody(element),
          rect = ElementView.getBoundingClientRect(element),
          adjustRight = detect.MSIE ? rect.right - rect.left - element.offsetWidth : 0;
      style.left = (offset.left + adjustRight + element[_WIDTH] - behavior._IMAGE_WIDTH + element.clientLeft) + PX;
      style.top = (offset.top + element.clientTop) + PX;
      timer = null;
    };
    function onblur() {
      if (document.activeElement == null) {
        if (event.preventDefault) event.preventDefault();
      } else {
        _private.detachEvent(element, inputType, oninput, true);
        _private.detachEvent(element, blurType, onblur, true);
        _private.detachEvent(window, "onresize", resize, true);
        style.display = "none";
        resetScroll();
        delete shim.element;
      }
    };
    function resize() {
      if (!timer) timer = setTimeout(position, 50);
    };
    _private.attachEvent(window, "onresize", resize);
    position();
    setTimeout(function() {
      style.display = "block";
    }, 1);
  },
  
  onmouseover: _shimMouseOverOut,
  onmouseout: _shimMouseOverOut,

  onmousedown: _shimLayout,
  onmouseup: _shimLayout,
  onkeydown: _shimLayout,

  onkeyup: function(element, event, keyCode) {
    if (!PopupWindow.current && keyCode == 35) { // END key
      element.scrollLeft = 9999;
    } else {
      this.base(element, event, keyCode);
    }
    if (shim.element == element) shim.layout();
  },
  
  layout: function(element, state) {
    this.base(element, state);
    if (element == shim.element) {
      shim.layout();
    }
  },
  
  matchesSelector: function(element, selector) {
    return this.base(element, selector) ||
      (/^:(hover|active)$/.test(selector) && element == shim.element && this.base(shim.control, selector));
  }
};

var shim = behavior.extend({
  jsbExtendedMouse: true,
  
  onclick: _shimMouse,
  ondblclick: _shimMouse,
  onmousedown: _shimMouse,
  onmouseup: _shimMouse,
  onmousemove: _shimMouse,

  onmouseover: _shimMouseOverOut2,
  onmouseout: _shimMouseOverOut2,

  layout: function() {
    if (this.element) {
      this.control.style.backgroundPosition = this.element.style.backgroundPosition;
    }
  }
});

function _shimLayout(element, event) {
  this.base.apply(this, arguments);
  if (element == shim.element) shim.layout();
};

function _shimMouse(element, event) {
  event.stopPropagation();
  if (event.type == "mousedown") event.preventDefault();
  this.dispatchEvent(this.element, event.type, event); // event forwarding only works in MSIE
  /*var method = "on" + event.type; // use this for event forwarding in other browsers
  if (this.element && this.behavior[method]) {
    var offset = ElementView.getOffsetXY(this.element, event.clientX, event.clientY);
    this.behavior[method](this.element, event, offset.x, offset.y);
  }*/
  this.layout();
};

function _shimMouseOverOut(element, event, x, y) {
  if (element != shim.element || !event.relatedTarget || event.relatedTarget != shim.control) {
    this.base(element, event, x, y);
  }
  if (shim.element == element) shim.layout();
};

function _shimMouseOverOut2(element, event, x, y) {
  event.stopPropagation();
  if (this.element && event.relatedTarget != this.element) {
    event.target = this.element;
    this.behavior["on" + event.type](this.element, event, x, y);
  }
  this.layout();
};
