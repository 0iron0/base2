
var Popup = Base.extend({
  constructor: function(owner) {
    this.owner = owner;
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

  scrollX: true,
  scrollY: true,
  
  // events
  
  setUnselectable: function(element) {
    element.onselect =
    element.onselectstart = False;
    element.setAttribute("unselectable", "on");
  },

  handleEvent: function(event) {
    //event.stopPropagation();
    
    switch (event.type) {
    //case "mousedown":
    ////event.preventDefault();
    //  break;
      case "mouseover":
      case "mouseout":
        if (event.target == this.body) return;
    }
    this["on" + event.type](event);
  },

  onkeydown: function(event) {
    if (event.keyCode == 27) { // escape
      this.hide();
    }
  },

  //onmousedown: Undefined,
  //onmouseup: Undefined,
  
  // methods
  
  isActive: function() {
    return this._active || Element.matchesSelector(this.body, ":hover");
  },

  createBody: function() {
    return document.createElement("div");
  },

  getRect: function() {
    var self = this,
        body = self.body,
        element = self.element,
        rect = ElementView.getBoundingClientRect(element),
        client = document.documentElement,
        left = 0,
        top = element.offsetHeight - 1,
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
          height = Math.min(height, Math.max(client.clientHeight - rect.bottom - 2, rect.top - 2));
        }
        if (unitHeight > 1) height = 2 + Math.floor(height / unitHeight) * unitHeight;
      }
      if (width == "auto") {
        width = body.scrollWidth + 2;
        if (height < body.scrollHeight + 2) width += 22; // scrollbars
        if (self.scrollX) {
          width = Math.min(width, Math.max(client.clientWidth - rect.left - 2, rect.right - 2));
        }
        width =  Math.max(width, element.offsetWidth);
      }
    }
    if (height > client.clientHeight - rect.bottom && height < rect.bottom) {
      top = -height;
    }
    if (width > client.clientWidth - rect.right && width < rect.right) {
      left = element.offsetWidth - width;
    }
    return new Rect(left, top, width, height);
  },
  
  getUnitHeight: K(1),

  hide: function() {
    //console2.log("HIDE");
    var parent = this.body.parentNode;
    if (parent) parent.removeChild(this.body);
    this.previousElement = this.element;
    delete this.element;
    Popup.current = null;
  },

  isOpen: function() {
    return !!this.body.parentNode;
  },

  layout: Undefined,

  movesize: function() {
    document.body.appendChild(this.body);
    var style = this.body.style,
        rect = this.getRect(),
        offset = ElementView.getBoundingClientRect(this.element),
        client = document.documentElement;
    style.left = (rect.left + offset.left + client.scrollLeft) + PX;
    style.top = (offset.top + rect.top + client.scrollTop) + PX;
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

  show: function(element) {
    //console2.log("SHOW");
    this.element = element;
    if (this.element != this.previousElement) {
      this.render();
    }
    this.style();
    this.movesize();
    this.layout();
    this.body.style.visibility = "visible";
    Popup.current = this;
  },

  style: function() {
    var style = this.body.style;
    //style.cssText = "left:-999px;top:-999px;width:2px;height:2px;overflow:hidden!important";
    style.cssText = "left:-999px;top:-999px;";
    var computedStyle = behavior.getComputedStyle(this.element);
    forEach.csv("backgroundColor,color,fontFamily,fontSize,fontWeight,fontStyle", function(propertyName) {
      style[propertyName] = computedStyle[propertyName];
    });
    if (style.backgroundColor == "transparent") {
      style.backgroundColor = "white";
    }
  },
  
  "@MSIE[56]": {
    hide: function() {
      this.base();
      if (this._iframe) {
        document.body.removeChild(this._iframe);
        delete this._iframe;
      }
    },
    
    show: function(element) {
      this.base(element);
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
      document.body.appendChild(iframe);
    }
  }

/* - this.problem does not seem to occur.

  // Inserting content into the document body whilst it is loading will result
  // in an "operation aborted" error. So we use a popup object instead. (MSIE)
  "@(typeof createPopup=='object2')": {
    createBody: function() {
      var popup = this.popup = createPopup(),
          document = popup.document,
          body = document.body;
      document.createStyleSheet().cssText = "body{margin:0}body *{cursor:default}" + jsb.theme.cssText;
      assignID(document);
      popup.show(); // init
      popup.hide();
      return body;
    },

    handleEvent: function(event) {
      if (event.type == "mousedown") {
        this.onmousedown(event);
      } else {
        this.base(event);
      }
    },
    
    hide: function() {
      //console2.log("HIDE");
      this.popup.hide();
      this.previousElement = this.element;
      delete this.element;
      Popup.current = null;
    },

    isOpen: function() {
      return this.popup.isOpen;
    },

    movesize: function() {
      var self = this,
          popup = self.popup;
          
      if (self.width == "auto" || self.height == "auto") {
        this.body.onload = function() {
          setTimeout(show, 1);
        };
        popup.show(-999, -999, 2, 2, self.element);
      } else {
        show();
      }

      function show() {
        var rect = self.getRect();
        popup.show(rect.left, rect.top, rect.width, rect.height, self.element);
      };
    }
  }*/
}, {
  current: null,
  
  init: function() {
    EventTarget.addEventListener(window, "blur", hidePopup, false);
    EventTarget.addEventListener(document, "mousedown", hidePopup, false);
    function hidePopup(event) {
      var popup = Popup.current,
          target = event.target;
      if (popup && target != document && target != popup.element && target != shim.control && !Traversal.contains(popup.body, target)) {
        popup.hide();
      }
    };
  }
});
