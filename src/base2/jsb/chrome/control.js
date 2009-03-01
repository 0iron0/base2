
var control = behavior.extend({
  // constants
  
  HORIZONTAL: 0,
  VERTICAL: 1,

  states: {
    normal:   0,
    hover:    1,
    active:   2,
    disabled: 3,
    length:   4
  },
  
  // properties

  allowVertical: false,
  appearance: "",
  imageWidth: 17,
  
  // events
  
  onattach: function(element) {
    if (this.allowVertical && element[_HEIGHT] > element[_WIDTH]) {
      this.setOrientation(element, this.VERTICAL);
    }
    this.layout(element, this.states[element.disabled ? "disabled" : "normal"]);
  },

  onmousedown: function(element, event, x, y) {
    control._active = element;

    if (!this.isEditable(element)) return;

    control._activeThumb = this.hitTest(element, x, y);
    if (control._activeThumb) {
      this.captureMouse(element);
    }
    this.layout(element);
  },

  onmouseup: function(element, event) {
    delete control._active;
    if (control._activeThumb) {
      delete control._activeThumb;
      this.layout(element);
    }
    this.releaseMouse();
  },

  onmousemove: function(element, event, x, y) {
    var thumb = this.hitTest(element, x, y);
    if (thumb != control._hoverThumb) {
      control._hoverThumb = thumb;
      this.layout(element);
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
    this.layout(element);
  },

  "@!MSIE[567]": {
    onblur: function(element) {
      this.removeClass(element, this.appearance + _FOCUS);
      this.base(element);
    }
  },
  
  // methods

  isActive: function(element) {
    return control._activeThumb && (control._activeThumb == control._hoverThumb);
  },

  isEditable: function(element) {
    return !element.disabled && !element.readOnly;
  },

  isNativeControl: False,

  getCursor: function(element) {
    return (control._activeThumb || control._hoverThumb || element != control._hover) ? "default" : "";
  },

  syncCursor: function(element) {
    var cursor = this.getCursor(element),
        style = element.style;
    if (style.cursor != cursor) {
      style.cursor = cursor;
    }
  },

  getState: K(0),

  hitTest: function(element, x) {
    //var rtl = element.currentStyle.direction == "rtl";
    var rtl = false;
    return rtl ? x <= this.imageWidth : x >= element[_WIDTH] - this.imageWidth;
  },

  setOrientation: function(element, orientation) {
    if (orientation == this.VERTICAL) {
      _vertical[element.uniqueID] = true;
      this.setStyle(element, "background-image", "url(" + chrome.host + chrome.theme + "/" + this.appearance + "-vertical.png)", true);
    } else {
      delete _vertical[element.uniqueID];
      element.style.backgroundImage = "";
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

  layout: function(element, state) {
    if (state == null) state = this.getState(element);
    var clientHeight = element[_HEIGHT],
        top = - this.states.length * (clientHeight / 2 * (clientHeight - 1)),
        style = element.style;
    top -= clientHeight * state;
    var backgroundPosition = "right " + top + PX;
    if (style.backgroundPosition != backgroundPosition) {
      style.backgroundPosition = backgroundPosition;
    }
    this.syncCursor(element);
  },

  "@Opera": {
    syncCursor: Undefined
  }
});
