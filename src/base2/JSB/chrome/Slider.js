
var Slider = ProgressBar.extend({
/* oncontentready: function(element) {
    //element.onselect = False;
    element.onselectstart = False;
    // default behaviour
    this.base(element);
  }, */

  "@KHTML|opera[91]": {
    oncontentready: function(element) {
      if (element.nodeName == "INPUT" && element.type != "range") {
        element.type = "range";
      }
    }
  },
  
  onmousedown: function(element, event, x, y, screenX, screenY) {
    this.base(element, event, x, y);
    if (!this.isEditable(element)) return;
    if (Chrome._activeThumb) {
      var thumb = this.getThumbRect(element);
      Chrome._dragInfo = {
        dx: screenX - thumb.left,
        dy: screenY - thumb.top
      };
      this.layout(element); // make thumb active
      Chrome._firedOnce = true;
    } else {
      this.startTimer(element);
      Chrome._eventClientX = event.clientX;
      Chrome._eventClientY = event.clientY;
    }
  },

  onmouseup: function(element, event) {
    this.base(element, event);
    //event.preventDefault();
    delete Chrome._dragInfo;
    if (!Chrome._firedOnce) this.tick(element);
    this.stopTimer(element);
    delete Chrome._eventClientX;
    delete Chrome._eventClientY;
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
      this.base(element, event, x, y);
    }
  },

  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    if (keyCode < 33 || keyCode > 40) return;
    
    switch (keyCode) {
      case 33: // page up
        this.increment(element, 1, true);
        break;
      case 34: // page down
        this.increment(element, -1, true);
        break;
      case 35: // end
        this.setValue(element, 1);
        break;
      case 36: // home
        this.setValue(element, 0);
        break;
      case 38: // up
      case 39: // right
        this.increment(element, 1);
        break;
      case 37: // left
      case 40: // down
        this.increment(element, -1);
        break;
    }
    event.preventDefault();
  }
}, {
  HORIZONTAL_WIDTH: 3000,
  HORIZONTAL_HEIGHT: 21,
  VERTICAL_WIDTH: 22,
  VERTICAL_HEIGHT: 3000,
  THUMB_WIDTH: 11,
  THUMB_HEIGHT: 11,

  image: "slider",
  
  "@KHTML|opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "range";
    }
  },
  
  layout: function(element, state) {
    // TODO: Right to left should invert horizontal
    
    if (state == null) state = this.getState(element);

		var base2ID = element.base2ID;
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
    if (clientWidth >= clientHeight) {
      var backgroundPosition = (
        Math.floor((clientWidth - this.THUMB_WIDTH) * _values[base2ID]) -
        Math.ceil((this.HORIZONTAL_WIDTH - this.THUMB_WIDTH) / 2) -
        state * this.HORIZONTAL_WIDTH
      ) + PX + " center";
      if (!_vertical[base2ID]) this.setOrientation(element, this.HORIZONTAL);
    } else {
      backgroundPosition = "center " + (
        clientHeight - this.THUMB_HEIGHT - Math.floor(clientHeight * _values[base2ID]) -
				Math.ceil((this.VERTICAL_HEIGHT - this.THUMB_HEIGHT) / 2) -
        state * this.VERTICAL_HEIGHT
      ) + PX;
      if (!_vertical[base2ID]) this.setOrientation(element, this.VERTICAL);
    }
    if (element.style.backgroundPosition != backgroundPosition) {
      element.style.backgroundPosition = backgroundPosition;
    }
  },

  getThumbRect: function(element) {
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
		var value = _values[element.base2ID];
    if (clientWidth >= clientHeight) {
      return new Rect(
        Math.floor((clientWidth - this.THUMB_WIDTH) * value),
        Math.floor((clientHeight - this.HORIZONTAL_HEIGHT) / 2),
        this.THUMB_WIDTH,
        this.HORIZONTAL_HEIGHT
      );
    } else {
      return new Rect(
        Math.floor((clientWidth - this.VERTICAL_WIDTH) / 2),
        clientHeight - this.THUMB_HEIGHT - Math.floor(clientHeight * value),
        this.VERTICAL_WIDTH,
        this.THUMB_HEIGHT
      );
    }
  },
  
  hitTest: function(element, x, y) {
    if (element.disabled) return null;
    if (this.isNativeControl(element)) return null;
    return this.getThumbRect(element).contains(x, y);
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (Chrome._hover == element && Chrome._activeThumb) {
      state = "active";
    } else if ((Chrome._hover == element && Chrome._hoverThumb) || (Chrome._focus == element && Chrome._active != element)) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  tick: function(element) {
    var rect = this.getBoundingClientRect(element);
    var thumb = this.getThumbRect(element);
    if (element.clientWidth >= element.clientHeight) {
      var mx = Chrome._eventClientX - rect.left;
      // _increasing is true, false or null
      if (mx < thumb.left && Chrome._increasing != true) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      } else if (mx > thumb.left + this.THUMB_WIDTH && Chrome._increasing != false) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      }
    } else {
      var my = Chrome._eventClientY - rect.top;
      if (my < thumb.top && Chrome._increasing != false) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      } else if (my > thumb.top + this.THUMB_HEIGHT && Chrome._increasing != true) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      }
    }
    Chrome._firedOnce = true;
  }
});
