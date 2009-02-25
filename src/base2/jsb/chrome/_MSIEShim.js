
// Damn. This is way too big. :-(
// All this because MSIE does not respect padding in <input> elements.

var _MSIEShim = {
  onfocus: function(element) {
    this.base.apply(this, arguments);
    var shim =_MSIEShim.control;
    if (!shim) {
      var document = element.document;
      shim =_MSIEShim.control = document.createElement("!");
      document.body.insertBefore(shim, document.body.firstChild);
    }
    _MSIEShim.element = element;
    var behavior = this, style = shim.style, timer;
    style.cssText = "position:absolute;border:0;display:block";
    //;;; style.backgroundColor = "red";
    style.pixelHeight = element.clientHeight;
    style.pixelWidth = behavior.imageWidth;
    position();
    style.backgroundImage = element.currentStyle.backgroundImage;
    behavior.attach(shim);
    behavior.layout(shim);
    element.attachEvent("onpropertychange", change);
    element.attachEvent("onfocusout", function() {
      element.detachEvent("onpropertychange", change);
      element.detachEvent("onfocusout", arguments.callee);
      element.scrollLeft = 9999;
      behavior.detach(shim);
      _MSIEShim.element = undefined;
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
      style.pixelLeft = offset.left + adjustRight + element.clientWidth - behavior.imageWidth + element.clientLeft;
      style.pixelTop = offset.top + element.clientTop;
      timer = null;
    };
    function resize() {
      if (!timer) timer = setTimeout(position, 50);
    };
    attachEvent("onresize", resize);
  },

  onkeyup: function(element, event, keyCode) {
    if (keyCode == 35 && !control._popup) {
      element.scrollLeft = 9999;
    } else {
      this.base(element, event, keyCode);
    }
  },

  onmouseover: _shimMouseOverOut,
  onmouseout: _shimMouseOverOut,

  onmousedown: function(element, event) {
    if (element == _MSIEShim.control) {
      element = _MSIEShim.element;
      event.preventDefault();
    }
    this.base.apply(this, arguments);
  },

  onmouseup: _shimMouse,
  onmousemove: _shimMouse,
  onmousewheel: _shimMouse,

  layout: function(element, state) {
    if (state == null) state = this.getState(element);
    this.base(element, state);
    if (element == _MSIEShim.element) element = _MSIEShim.control;
    this.base(element, state);
  }
};

function _shimMouse(element, event) {
  if (element == _MSIEShim.control) element = _MSIEShim.element;
  this.base.apply(this, arguments);
};

function _shimMouseOverOut(element, event) {
  if (!(element === _MSIEShim.element && event.relatedTarget == _MSIEShim.control) &&
      !(element == _MSIEShim.control && event.relatedTarget === _MSIEShim.element)) {
    if (element == _MSIEShim.control) element = _MSIEShim.element;
    this.base.apply(this, arguments);
  }
};
