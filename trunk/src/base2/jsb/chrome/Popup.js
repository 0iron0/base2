
var Popup = Base.extend({
  constructor: function() {
    var body = this.body = this.createBody();
    body.className = "jsb-popup";
    var appearance = this.appearance;
    if (appearance && appearance != "popup") {
      body.className += " jsb-" + appearance;
    }
    var popup = this;
    for (var i in popup) {
      if (_EVENT.test(i)) {
        EventTarget.addEventListener(body, i.slice(2), this, true);
      }
    }
  },

  // properties

  appearance: "popup",
  element: null,
  body: null,
  
  // the following properties describe how the popup should be positioned/
  
  width: "auto", // "auto" or length
  height: "auto",
  
  position: "below", // show above or below the control?

  scrollX: false, // allow scrolling?
  scrollY: false,

  offsetX: 0, // offset distance from the control
  offsetY: 0,
  
  // events

  "@Gecko1\\.[^9]": {
    onmousedown: function(event) {
      event.preventDefault();
    }
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "mouseover":
      case "mouseout":
        if (event.target == this.body) return;
    }
    this["on" + event.type](event);
  },
  
  // methods

  createBody: function() {
    return document.createElement("div");
  },

  removeBody: function() {
    var parent = this.body[_PARENT];
    if (parent) parent.removeChild(this.body);
  },

  getRect: function() {
    var viewport = detect("QuirksMode|Gecko1\\.[0-3]") ? document.body : document.documentElement,
        popup    = this.body,
        element  = this.element,
        rect     = ElementView.getBoundingClientRect(element),
        left     = 0,
        top      = this.position == "below" ? element.offsetHeight - 1 : - 1 - element.offsetHeight,
        width    = this.width,
        height   = this.height,
        offsetX  = this.offsetX,
        offsetY  = this.offsetY;

    if (width == "base") {
      width = element.offsetWidth;
    }

    // resize
    if (width == "auto" || height == "auto") {
      if (height == "auto") {
        height = popup.scrollHeight + 2;
        var unitHeight = this.getUnitHeight();
        if (this.scrollY) {
          height = Math.min(height, Math.max(viewport[_HEIGHT] - rect.bottom - 2, rect.top - 2));
        }
        if (unitHeight > 1) height = 2 + ~~(height / unitHeight) * unitHeight;
      }
      if (width == "auto") {
        width = popup.scrollWidth + 2;
        if (height < popup.scrollHeight + 2) width += 22; // scrollbars
        if (this.scrollX) {
          width = Math.min(width, Math.max(viewport[_WIDTH] - rect.left - 2, rect.right - 2));
        }
        width =  Math.max(width, element.offsetWidth);
      }
    }
    if (height > viewport[_HEIGHT] - rect.bottom && height < rect.bottom) {
      top = -height;
      offsetY *= -1;
    }
    if (width > viewport[_WIDTH] - rect.right && width < rect.right) {
      left = element.offsetWidth - width;
      offsetX *= -1;
    }
    return new Rect(left + offsetX, top + offsetY, width, height);
  },
  
  getUnitHeight: K(1),

  hide: function() {
    this.removeBody();
  },

  isOpen: function() {
    return !!this.body[_PARENT];;// && this.body.style.visibility == "visible";
  },

  layout: Undefined,

  movesize: function() {
    document.body.appendChild(this.body);
    var rect    = this.getRect(),
        offset  = ElementView.getOffsetFromBody(this.element);
    behavior.setStyle(this.body, {
      left: offset.left,
      top: offset.top + rect.top,
      width: Math.max(rect.width - 2, 100),
      height: Math.max(rect.height - 2, 22)
    });
  },

  querySelector: function(selector) {
    return NodeSelector.querySelector(this.body, selector);
  },

  querySelectorAll: function(selector) {
    return NodeSelector.querySelectorAll(this.body, selector);
  },

  render: function(html) {
    this.body.innerHTML = trim(html) || "";
  },

  setUnselectable: function(element) {
    element.unselectable = "on";
    behavior.setStyle(element, "userSelect", "none");
  },

  show: function(element) {
    this.element = element;
    this.render();
    this.style();
    this.movesize();
    this.layout();
    this.body.style.visibility = "visible";
  },

  style: function() {
    var style = this.body.style;
    style.left = "-999px";
    style.top = "-999px";
    style.width = "";
    style.height = "";
    var computedStyle = behavior.getComputedStyle(this.element);
    forEach.csv("backgroundColor,color,fontFamily,fontWeight,fontStyle", function(propertyName) {
      style[propertyName] = computedStyle[propertyName];
    });
    if (style.fontFamily == "MS She") { // old versions of gecko truncate this font for some reason
      style.fontFamily = "MS Shell Dlg"
    }
    style.fontSize = parseInt(computedStyle.fontSize) + PX;
    if (style.backgroundColor == "transparent") {
      style.backgroundColor = "white";
    }
  },

  "@MSIE(5.5|6)": { // prevent <select> boxes from bleeding through (doesn't work in MSIE5.0)
    removeBody: function() {
      var iframe = Popup._iframe;
      if (iframe[_PARENT]) {
        document.body.removeChild(iframe);
      }
      this.base();
    },

    createBody: function() {
      var iframe = Popup._iframe;
      if (!iframe) {
        iframe = Popup._iframe = document.createElement("iframe"),
        iframe.style.cssText = "position:absolute;z-index:999998!important";
        iframe.frameBorder = "0";
        iframe.scrolling = "no";
      }
      return this.base();
    },

    show: function(element) {
      this.base(element);
      var iframe = Popup._iframe,
          //style = iframe.style,
          body = this.body,
          bodyStyle = body.currentStyle;
      behavior.setStyle(iframe, {
        left: bodyStyle.left,
        top: bodyStyle.top,
        width: body.offsetWidth,
        height: body.offsetHeight,
        backgroundColor: bodyStyle.backgroundColor
      });
      /*style.left = bodyStyle.left;
      style.top = bodyStyle.top;
      style.width = body.offsetWidth + PX;
      style.height = body.offsetHeight + PX;
      style.backgroundColor = bodyStyle.backgroundColor;*/
      document.body.appendChild(iframe);
    }
  }
});
