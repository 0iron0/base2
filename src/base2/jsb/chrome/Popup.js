
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
        EventTarget.addEventListener(body, i.slice(2), this, /onblur|onfocus/.test(i));
      }
    }
  },

  // properties

  appearance: "popup",
  width: "auto",
  height: "auto",
  element: null,
  body: null,
  position: "below",

  scrollX: false,
  scrollY: false,
  
  // events

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

  getRect: function() {
    var documentElement = document.documentElement,
        self = this,
        body = self.body,
        element = self.element,
        rect = ElementView.getBoundingClientRect(element),
        left = 0,
        top = self.position == "below" ? element.offsetHeight - 1 : - 1 - element.offsetHeight,
        width = self.width,
        height = self.height;

    if (width == "base") {
      width = element.offsetWidth;
    }

    // resize
    if (width == "auto" || height == "auto") {
      if (height == "auto") {
        height = body.scrollHeight + 2;
        var unitHeight = self.getUnitHeight();
        if (self.scrollY) {
          height = Math.min(height, Math.max(documentElement.clientHeight - rect.bottom - 2, rect.top - 2));
        }
        if (unitHeight > 1) height = 2 + Math.floor(height / unitHeight) * unitHeight;
      }
      if (width == "auto") {
        width = body.scrollWidth + 2;
        if (height < body.scrollHeight + 2) width += 22; // scrollbars
        if (self.scrollX) {
          width = Math.min(width, Math.max(documentElement.clientWidth - rect.left - 2, rect.right - 2));
        }
        width =  Math.max(width, element.offsetWidth);
      }
    }
    if (height > documentElement.clientHeight - rect.bottom && height < rect.bottom) {
      top = -height;
    }
    if (width > documentElement.clientWidth - rect.right && width < rect.right) {
      left = element.offsetWidth - width;
    }
    return new Rect(left, top, width, height);
  },
  
  getUnitHeight: K(1),

  hide: function() {
    var parent = this.body.parentNode;
    if (parent) parent.removeChild(this.body);
    delete this.element;
  },

  isOpen: function() {
    return !!this.body.parentNode;
  },

  layout: Undefined,

  movesize: function() {
    document.body.appendChild(this.body);
    var style = this.body.style,
        rect = this.getRect(),
        offset = ElementView.getBoundingClientRect(this.element);
    style.left = (rect.left + offset.left + _CLIENT[_SCROLL_LEFT]) + PX;
    style.top = (offset.top + rect.top + _CLIENT[_SCROLL_TOP]) + PX;
    style.width = (rect.width - 2) + PX;
    style.height = (rect.height - 2) + PX;
  },

  querySelector: function(selector) {
    return NodeSelector.querySelector(this.body, selector);
  },

  querySelectorAll: function(selector) {
    return NodeSelector.querySelectorAll(this.body, selector);
  },

  render: function(html) {
    this.body.innerHTML = html || "";
  },

  setUnselectable: function(element) {
    //element.onselect =
    //element.onselectstart = False;
    element.unselectable = "on";
    element.style.userSelect = "none";
    element.style[ViewCSS.VENDOR + "UserSelect"] = "none";
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
    style.cssText = "left:-999px;top:-999px;";
    var computedStyle = behavior.getComputedStyle(this.element);
    forEach.csv("backgroundColor,color,fontFamily,fontWeight,fontStyle", function(propertyName) {
      style[propertyName] = computedStyle[propertyName];
    });
    style.fontSize = parseInt(computedStyle.fontSize) + PX;
    if (style.backgroundColor == "transparent") {
      style.backgroundColor = "white";
    }
  },
  
  "@MSIE[56]": { // prevent <select> boxes from bleeding through
    hide: function() {
      this.base();
      if (this._iframe.parentNode) {
        document.body.removeChild(this._iframe);
      }
    },
    
    show: function(element) {
      this.base(element);
      if (!this._iframe) {
        var iframe = this._iframe = document.createElement("iframe"),
            style = iframe.style,
            body = this.body,
            bodyStyle = body.style;

        style.cssText = "position:absolute;z-index:999998!important";
        iframe.frameBorder = "0";
        style.left = bodyStyle.left;
        style.top = bodyStyle.top;
        style.pixelWidth = body.offsetWidth;
        style.pixelHeight = body.offsetHeight;
      }
      document.body.appendChild(this._iframe);
    }
  }
});
