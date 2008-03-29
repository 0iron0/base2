
var Slider = ProgressBar.extend({
  onmousedown: function(element, event, x, y, screenX, screenY) {
    base(this, arguments);
    event.preventDefault();
    if (!this.isEditable(element)) return;
    if (Chrome._activeThumb) {
      var thumb = this.getThumbRect(element);
      Chrome._dragInfo = {
        dx: screenX - thumb.left,
        dy: screenY - thumb.top
      };
      Chrome._firedOnce = true;
    } else {
      this.startTimer(element);
      Chrome._eventX = x;
      Chrome._eventY = y;
    }
    element.focus();
  },

  "@theme=aqua": {
    onblur: function(element) {
      if (element == Slider._activeElement) {
        delete Slider._activeElement;
      }
      base(this, arguments);
    },

    onmousedown: function(element) {
      Slider._activeElement = element;
      base(this, arguments);
    }
  },

  onmouseup: function(element, event) {
    this.base(element, event);
    delete Chrome._dragInfo;
    if (!Chrome._firedOnce) this.tick(element);
    this.stopTimer(element);
    delete Chrome._eventX;
    delete Chrome._eventY;
    delete Chrome._increasing;
    delete Chrome._firedOnce;
  },

  onmousemove: function(element, event, x, y, screenX, screenY) {
    if (Chrome._dragInfo) {
      var clientWidth = element.clientWidth;
      var clientHeight = element.clientHeight;
      if (clientWidth >= clientHeight) {
        var size = clientWidth - this.THUMB_WIDTH;
        var pos = screenX - Chrome._dragInfo.dx;
      } else {
        size = clientHeight - this.THUMB_HEIGHT;
        pos = size - screenY + Chrome._dragInfo.dy;
      }
      this.setValue(element, pos / size);
    } else {
      base(this, arguments);
    }
  }
}, {
  HORIZONTAL_WIDTH: 3000,
  HORIZONTAL_HEIGHT: 21,
  VERTICAL_WIDTH: 22,
  VERTICAL_HEIGHT: 3000,
  THUMB_WIDTH: 11,
  THUMB_HEIGHT: 11,

  appearance: "slider",

  "@KHTML|opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "range";
    }
  },

  layout: function(element, state) {
    // TODO: Right to left should invert horizontal
    if (state == null) state = this.getState(element);
    
    var thumb = this.getThumbRect(element);

    if (_vertical[element.base2ID]) {
      var left = thumb.left;
      var top = thumb.top - Math.ceil((this.VERTICAL_HEIGHT - this.THUMB_HEIGHT) / 2) - state * this.VERTICAL_HEIGHT;
    } else {
      left = thumb.left - Math.ceil((this.HORIZONTAL_WIDTH - this.THUMB_WIDTH) / 2) - state * this.HORIZONTAL_WIDTH;
      top = thumb.top;
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
    //;;;console2.log("layout: "+element.style.backgroundPosition);
  },

  getThumbRect: function(element) {
    var clientWidth = element.clientWidth,
        clientHeight = element.clientHeight,
        value = _values[element.base2ID];
        
    if (_vertical[element.base2ID]) {
      return new Rect(
        (clientWidth - this.VERTICAL_WIDTH) / 2,
        (clientHeight -= this.THUMB_HEIGHT) - Math.floor(clientHeight * value),
        this.VERTICAL_WIDTH,
        this.THUMB_HEIGHT
      );
    } else {
      return new Rect(
        Math.floor((clientWidth - this.THUMB_WIDTH) * value),
        Math.floor((clientHeight - this.HORIZONTAL_HEIGHT) / 2),
        this.THUMB_WIDTH,
        this.HORIZONTAL_HEIGHT
      );
    }
  },

  hitTest: function(element, x, y) {
    if (element.disabled || this.isNativeControl(element)) return null;
    return this.getThumbRect(element).contains(x, y);
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element == Chrome._active && Chrome._activeThumb) {
      state = "active";
    } else if (element == Chrome._focus || (element == Chrome._hover && Chrome._hoverThumb)) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },
  
  "@theme=aqua": {
    getState: function(element) {
      if (element.disabled) {
        var state = "disabled";
      } else if (element == Chrome._active && Chrome._activeThumb) {
        state = "active";
      } else if (element == Chrome._focus && element != Slider._activeElement) {
        state = "hover";
      } else {
        state = "normal";
      }
      return this.states[state];
    },

    startTimer: function(element) {
      // the aqua slider jumps immediatley to wherever you click
    },

    tick: Undefined
  },

  tick: function(element) {
    var thumb = this.getThumbRect(element);
    if (_vertical[element.base2ID]) {
      var my = Chrome._eventY;
      if (my < thumb.top && false != Chrome._increasing) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      } else if (my > thumb.top + this.THUMB_HEIGHT && true != Chrome._increasing) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      }
    } else {
      var mx = Chrome._eventX;
      // _increasing is true, false or null
      if (mx < thumb.left && true != Chrome._increasing) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      } else if (mx > thumb.left + this.THUMB_WIDTH && false != Chrome._increasing) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      }
    }
    Chrome._firedOnce = true;
  }
});
