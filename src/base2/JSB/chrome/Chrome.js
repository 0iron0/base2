
var Chrome = Behavior.extend({
  oncontentready: function(element) {
    if (element.clientHeight > element.clientWidth) {
      this.setOrientation(element, this.VERTICAL);
    }
    this.layout(element, this.states[element.disabled ? "disabled" : "normal"]);
  },

  onmousedown: function(element, event, x, y) {
    //;;; console2.log("onmousedown(" + event.eventPhase + "): " + event.button);
    Chrome._active = element;

    if (!this.isEditable(element)) return;

    Chrome._activeThumb = this.hitTest(element, x, y);
    if (Chrome._activeThumb) {
      this.setCapture(element);
    }
    this.layout(element);
  },

  onmouseup: function(element, event) {
    //;;; console2.log("onmouseup(" + event.eventPhase + "): " + event.button);
    delete Chrome._active;
    if (Chrome._activeThumb) {
      delete Chrome._activeThumb;
      this.layout(element);
    }
    this.releaseCapture(element);
  },

  onmousemove: function(element, event, x, y) {
    //console2.log("onmousemove: "+[x,y]);
    var thumb = this.hitTest(element, x, y);
    if (thumb != Chrome._hoverThumb) {
      Chrome._hoverThumb = thumb;
      this.layout(element);
    }
  },

  onmouseover: function(element, event, x, y) {
    Chrome._hover = element;
    Chrome._hoverThumb = this.hitTest(element, x, y);
    this.layout(element);
  },

  onmouseout: function(element) {
    //console2.log("onmouseout");
    delete Chrome._activeThumb;
    delete Chrome._hoverThumb;
    delete Chrome._hover;
    this.layout(element);
  },

  onfocus: function(element) {
    Chrome._focus = element;
    this.layout(element);
  },

  onblur: function(element) {
    delete Chrome._focus;
    this.removeClass(element, this.appearance + _FOCUS);
    this.layout(element);
  }
}, {
  HORIZONTAL: 0,
  VERTICAL: 1,

  states: {
    normal:   0,
    hover:    1,
    active:   2,
    disabled: 3,
    length:   4
  },

  appearance: "",

  imageWidth: 17,

  isActive: function(element) {
    return Chrome._activeThumb && (Chrome._activeThumb == Chrome._hoverThumb);
  },

  isEditable: function(element) {
    return !element.disabled && !element.readOnly;
  },

  isNativeControl: False,

  getCursor: function(element) {
    return (Chrome._activeThumb || Chrome._hoverThumb || element != Chrome._hover) ? "default" : "";
  },

  syncCursor: function(element) {
    element.style.cursor = this.getCursor(element);
  },

  getState: K(0),

  hitTest: function(element, x) {
    //var rtl = element.currentStyle.direction == "rtl";
    var rtl = false;
    return rtl ? x <= this.imageWidth : x >= element.clientWidth - this.imageWidth;
  },

  setOrientation: function(element, orientation) {
    if (orientation == this.VERTICAL) {
      _vertical[element.base2ID] = true;
      this.setCSSProperty(element, "background-image", "url(" + chrome.host + chrome.theme + "/" + this.appearance + "-vertical.png)", true);
    } else {
      delete _vertical[element.base2ID];
      element.style.backgroundImage = "";
    }
  },

  hasTimer: function(element, id) {
    id = element.base2ID + (id || _TIMER);
    return !!_timers[id];
  },

  startTimer: function(element, id, interval, repeat) {
    id = element.base2ID + (id || _TIMER);
    if (!_timers[id]) {
      _timers[id] = setInterval(bind(this.tick, this, element), 100);
    }
  },

  stopTimer: function(element, id) {
    id = element.base2ID + (id || _TIMER);
    if (_timers[id]) {
      clearInterval(_timers[id]);
      delete _timers[id];
    }
  },

  tick: Undefined,

  layout: function(element, state) {
    if (state == null) state = this.getState(element);
    var clientHeight = element.clientHeight;
    var top = - this.states.length * (clientHeight / 2 * (clientHeight - 1));
    top -= clientHeight * state;
    element.style.backgroundPosition = "right " + top + PX;
    this.syncCursor(element);
  },

  handleEvent: function(element, event, type) {
    if (Chrome._captureMouse) {
      if (/^mouse(up|move)$/.test(type)) {
        this.base(Chrome._captureElement, event);
      }
    } else if (!this.isNativeControl(element)) {
      this.base(element, event);
    }
  },

  setCapture: function(element) {
    if (!Chrome._captureMouse) {
      var behavior = this;
      Chrome._captureElement = element;
      Chrome._captureMouse = function(event) {
        if (_OPERA) getSelection().collapse(document.body, 0); // prevent text selection
        behavior.handleEvent(element, event, event.type);
      };
      this.addEventListener(document, "mouseup", Chrome._captureMouse, true);
      this.addEventListener(document, "mousemove", Chrome._captureMouse, true);
    }
  },

  releaseCapture: function() {
    if (Chrome._captureMouse) {
      this.removeEventListener(document, "mouseup", Chrome._captureMouse, true);
      this.removeEventListener(document, "mousemove", Chrome._captureMouse, true);
      delete Chrome._captureMouse;
      delete Chrome._captureElement;
    }
  },

  "@MSIE": {
    setCapture: function(element) {
      element.setCapture();
      behavior = this;
      element.attachEvent("onlosecapture", function() {
        if (Chrome._captureMouse) behavior.onmouseup(element);
        element.detachEvent("onlosecapture", arguments.callee);
      });
      this.base(element);
    },

    releaseCapture: function() {
      this.base();
      document.releaseCapture();
    }
  }
});
