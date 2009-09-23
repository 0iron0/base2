
var control = behavior.extend({
  // constants

  _CURSOR: "",
  _HORIZONTAL: 0,
  _VERTICAL: 1,
  _IMAGE_WIDTH: 17,
  
  "@Gecko1\\.[0-3]": {
    _CURSOR: "text"
  },

  states: {
    normal:   0,
    hover:    1,
    active:   2,
    disabled: 3,
    length:   4
  },
  
  // properties

  type: "text", // web forms 2.0 type
  appearance: "none",
  allowVertical: false,
  //autocomplete: "off",

  onattach: function(element) {
    if (this.isNativeControl != False && this.isNativeControl(element)) {
      this.detach(element, true);
    } else {
      _attachments[element.uniqueID] = this;
      
      if (this.allowVertical && element[_HEIGHT] > element[_WIDTH]) {
        this.setOrientation(element, this._VERTICAL);
      }
      
      // prevent autocomplete popups
      if (element.name && element.form) {
        // setting this attribute does not seem to cause a reflow
        element.setAttribute("autocomplete", "off");
      }
      
      this.layout(element, this.states[element.disabled ? "disabled" : "normal"]); // initial state
    }
  },

  "@MSIE[567]": {
    onattach: function(element) {
      if (this.appearance != "none") {
        ClassList.add(element, "jsb-" + this.appearance);
      }
      this.base(element);
    }
  },

  onlosecapture: function(element) {
    delete control._active;
    delete control._dragging;
    delete control._activeThumb;
    this.setUnselectable(element, false);
    this.layout(element);
  },

  onmousedown: function(element, event, x, y) {
    control._active = element;

    if (!this.isEditable(element)) return;

    control._activeThumb = this.hitTest(element, x, y);
    if (control._activeThumb) {
      this.setCapture(element);
      control._dragging = true;
      this.setTimeout("setUnselectable", 1, element, true);
    }
    this.layout(element);
  },

  onmouseup: function(element, event) {
    this.releaseCapture();
  },

  onmousemove: function(element, event, x, y) {
    var thumb = this.hitTest(element, x, y);
    if (thumb != control._hoverThumb) {
      control._hoverThumb = thumb;
      this.layout(element);
    }
    if (control._dragging) {
      event.preventDefault();
    }
  },

  onmouseover: function(element, event, x, y) {
    control._hover = element;
    control._hoverThumb = this.hitTest(element, x, y);
    this.layout(element);
  },

  onmouseout: function(element) {
    delete control._activeThumb;
    delete control._hoverThumb;
    delete control._hover;
    this.layout(element);
  },

  onfocus: function(element) {
    control._focus = element;
    this.layout(element);
  },

  onblur: function(element) {
    delete control._focus;
    this.removeClass(element, this.appearance + _FOCUS);
    this.layout(element);
    if (control.tooltip && control.tooltip.isOpen()) {
      control.tooltip.hide();
    }
  },

  onpropertyset: function(element, event, propertyName) {
    if (/^(disabled|readOnly)$/.test(propertyName)) {
      this.layout(element);
    }
  },
  
  // methods

  getCursor: function(element) {
    return (control._activeThumb || control._hoverThumb || element != control._hover || control._dragging) ? "default" : this._CURSOR;
  },

  getState: K(0),

  getValue: function(element) {
    return element.value;
  },

  setValue: function(element, value) {
    if (value != element.value) {
      element.value = value;
      this.dispatchEvent(element, "change");
      this.layout(element);
    }
  },

  hitTest: function(element, x) {
    //var rtl = element.currentStyle.direction == "rtl";
    var rtl = false;
    return rtl ? x <= this._IMAGE_WIDTH : x >= element[_WIDTH] - this._IMAGE_WIDTH;
  },

  isActive: function(element) {
    return control._activeThumb && (control._activeThumb == control._hoverThumb);
  },

  isEditable: function(element) {
    return (!element.disabled && !element.readOnly) || element == control._readOnlyTemp;
  },

  isNativeControl: False,

  "@(hasFeature('WebForms','2.0'))": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == this.type;
    }
  },

  layout: function(element, state) {
    if (state == null) {
      state = this.getState(element);
      this.syncCursor(element);
    }
    var clientHeight = element[_HEIGHT],
        top = - this.states.length * (clientHeight / 2 * (clientHeight - 1)),
        style = element.style;
    top -= clientHeight * state;

    var backgroundPosition = "100% " + top + PX;
    if (style.backgroundPosition != backgroundPosition) {
      style.backgroundPosition = backgroundPosition;
    }
  },

  setOrientation: function(element, orientation) {
    if (orientation == this._VERTICAL) {
      var backgroundImage = this.getComputedStyle(element, "backgroundImage");
      this.setStyle(element, "backgroundImage", backgroundImage.replace(/\.png/i, "-vertical.png"), true);
    } else if (element.style.backgroundImage) {
      element.style.backgroundImage = "";
    }
  },

  setUnselectable: Undefined,

  "@!Webkit": {
    setUnselectable: function(element, unselectable) {
      this.setStyle(element, "userSelect", unselectable ? "none" : "");
    }
  },

  "@MSIE": {
    setUnselectable: function(element, unselectable) {
      if (unselectable) {
        element.unselectable = "on";
      } else {
        element.removeAttribute("unselectable");
      }
    }
  },

  showToolTip: function(element, text, duration) {
    var tooltip = control.tooltip;
    if (!tooltip) {
      tooltip = control.tooltip = new ToolTip;
    }
    setTimeout(function() {
      tooltip.show(element, text, duration);
    }, 1);
  },

  syncCursor: function(element) {
    var cursor = this.getCursor(element),
        style = element.style;
    if (style.cursor != cursor) {
      style.cursor = cursor;
    }
  },

  hasTimer: function(element, id) {
    id = element.uniqueID + (id || _TIMER);
    return !!_timers[id];
  },

  startTimer: function(element, id, interval) {
    id = element.uniqueID + (id || _TIMER);
    if (!_timers[id]) {
      _timers[id] = this.setInterval(this.tick, 100, element);
    }
  },

  stopTimer: function(element, id) {
    id = element.uniqueID + (id || _TIMER);
    if (_timers[id]) {
      clearInterval(_timers[id]);
      delete _timers[id];
    }
  },

  tick: Undefined,

  "@Opera": {
    syncCursor: Undefined
  }
});
