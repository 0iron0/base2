
// Damn. This is way too big. :-(
// All this because MSIE does not respect padding in <input> elements.

var _MSIEShim = {
  onfocus: function(element) {
    this.base.apply(this, arguments);
    var behavior = this, timer;
    if (!shim.control) {
      shim.control = document.createElement("!");
      document.body.insertBefore(shim.control, document.body.firstChild);
      shim.attach(shim.control);
    }
    shim.element = element;
    shim.behavior = behavior;
    var style = shim.control.runtimeStyle;
    style.cssText = "position:absolute;border:0;display:none;background-position-x:right";
    style.pixelHeight = element.clientHeight;
    style.pixelWidth = behavior.IMAGE_WIDTH;
    style.backgroundImage = element.currentStyle.backgroundImage;
    shim.layout();
    element.attachEvent("onpropertychange", change);
    element.attachEvent("onfocusout", function() {
      element.detachEvent("onpropertychange", change);
      element.detachEvent("onfocusout", arguments.callee);
      element.scrollLeft = 9999;
      delete shim.element;
      style.display = "none";
      detachEvent("onresize", resize);
    });
    function change(event) {
      if (event.propertyName == "value") element.scrollLeft = 9999;
    };
    function position() {
      var offset = behavior.getOffsetFromBody(element),
          rect = element.getBoundingClientRect(),
          adjustRight = rect.right - rect.left - element.offsetWidth;
      style.pixelLeft = offset.left + adjustRight + element.clientWidth - behavior.IMAGE_WIDTH + element.clientLeft;
      style.pixelTop = offset.top + element.clientTop;
      timer = null;
    };
    function resize() {
      if (!timer) timer = setTimeout(position, 50);
    };
    attachEvent("onresize", resize);
    position();
    setTimeout(function() {
      style.display = "";
    }, 1);
  },
  
  onmouseover: _shimMouseOverOut,
  onmouseout: _shimMouseOverOut,
  onmouseup: function(element) {
    this.base.apply(this, arguments);
    if (element == shim.element) shim.layout();
  },

  onkeydown: function(element, event, keyCode) {
    this.base(element, event, keyCode);
    if (shim.element == element) shim.layout();
  },

  onkeyup: function(element, event, keyCode) {
    if (!Popup.current && keyCode == 35) { // END key
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
  }
};

var shim = behavior.extend({
  onmousedown: _shimMouse,
  onmousemove: _shimMouse,

  onmouseover: _shimMouseOverOut2,
  onmouseout: _shimMouseOverOut2,

  layout: function() {
    if (this.element) {
      this.control.runtimeStyle.backgroundPositionY = this.element.currentStyle.backgroundPositionY;
    }
  }
});

function _shimMouse(element, event, x, y, screenX, screenY) {
  if (event.type == "mousedown") {
    event.preventDefault();
  }
  event.stopPropagation();
  if (this.element) {
    var offset = ElementView.getOffsetXY(this.element, event.clientX, event.clientY);
    this.behavior["on" + event.type](this.element, event, offset.x, offset.y, screenX, screenY);
  }
  this.layout();
};

function _shimMouseOverOut(element, event) {
  if (!(element == shim.element && event.relatedTarget == shim.control)) {
    this.base(element, event);
  }
  if (shim.element == element) shim.layout();
};

function _shimMouseOverOut2(element, event) {
  if (this.element && event.relatedTarget != this.element) {
    this.behavior["on" + event.type](this.element, event);
  }
  this.layout();
};
