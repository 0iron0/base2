
var Chrome = Behavior.modify({
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
  
  oncontentready: function(element) {
    if (element[_HEIGHT] > element[_WIDTH]) {
      this.setOrientation(element, this.VERTICAL);
    }
    this.layout(element, this.states[element.disabled ? "disabled" : "normal"]);
  },

  onclick: function(element, event, x, y) {
    //;;; console2.log("onclick(" + event.eventPhase + "): " + event.button);
  },

  ondblclick: function(element, event, x, y) {
    //;;; console2.log("ondblclick(" + event.eventPhase + "): " + event.button);
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
    //;;; console2.log("onmousemove: "+[x,y]);
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
    //;;; console2.log("onmouseout");
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
  },

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
    return rtl ? x <= this.imageWidth : x >= element[_WIDTH] - this.imageWidth;
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

  startTimer: function(element, id, interval) {
    id = element.base2ID + (id || _TIMER);
    if (!_timers[id]) {
      _timers[id] = this.setInterval(this.tick, 100, element);
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
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT];
    var top = - this.states.length * (clientHeight / 2 * (clientHeight - 1));
    top -= clientHeight * state;
    element.style.backgroundPosition = (clientWidth - this.imageWidth) + PX + " " + top + PX;
    this.syncCursor(element);
  }
});
