
var Slider = ProgressBar.extend({
  "@KHTML--opera[91]": {
    onattach: function(element) {
      if (element.nodeName == "INPUT" && element.type != "range") {
        element.type = "range";
      }
    }
  },
  
  onmousedown: function(element, event, x, y, screenX, screenY) {
    base(this, arguments);
    if (!this.isEditable(element)) return;
    if (Chrome._activeThumb) {
      Chrome._dragInfo = {
        dx: screenX - Chrome._thumbLeft,
        dy: screenY - Chrome._thumbTop
      };
      Chrome._firedOnce = true;
    } else {
      this.startTimer(element);
      Chrome._eventX = x;
      Chrome._eventY = y;
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
  },

  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    if (keyCode < 33 || keyCode > 40) return;
    event.preventDefault();
    
    var amount = 1;
    
    switch (keyCode) {
      case 35: // end
        var value = 1;
      case 36: // home
        this.setValue(element, value || 0);
        return;
      case 33: // page up
        var block = true;
        break;
      case 34: // page down
        block = true;
      case 37: // left
      case 40: // down
        amount = -1;
    }
    this.increment(element, amount, block);
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

		var base2ID = element.base2ID;
		
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
		var value = _values[base2ID];
		
    if (clientWidth >= clientHeight) { // horizontal
			clientWidth -= this.THUMB_WIDTH;
			clientHeight -= this.HORIZONTAL_HEIGHT;
			var left = Chrome._thumbLeft = Math.floor(clientWidth * value);
			var top = Chrome._thumbTop = Math.floor(clientHeight / 2);
			left -= Math.ceil((this.HORIZONTAL_WIDTH - this.THUMB_WIDTH) / 2) +
        state * this.HORIZONTAL_WIDTH;
      if (!_vertical[base2ID]) this.setOrientation(element, this.HORIZONTAL);
    } else { // vertical
      clientWidth -= this.VERTICAL_WIDTH;
      clientHeight -= this.THUMB_HEIGHT;
      left = Chrome._thumbLeft = clientWidth / 2;
      top = Chrome._thumbTop = clientHeight - Math.floor(clientHeight * value);
			top -= Math.ceil((this.VERTICAL_HEIGHT - this.THUMB_HEIGHT) / 2) +
        state * this.VERTICAL_HEIGHT;
      if (!_vertical[base2ID]) this.setOrientation(element, this.VERTICAL);
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  },

  getThumbRect: function(element) {
    if (_vertical[element.base2ID]) {
      return new Rect(Chrome._thumbLeft, Chrome._thumbTop, this.VERTICAL_WIDTH, this.THUMB_HEIGHT);
    } else {
      return new Rect(Chrome._thumbLeft, Chrome._thumbTop, this.THUMB_WIDTH, this.HORIZONTAL_HEIGHT);
    }
  },
  
  hitTest: function(element, x, y) {
    if (element.disabled || this.isNativeControl(element)) return null;
    return this.getThumbRect(element).contains(x, y);
  },

  getState: function(element) {
		var state;
		if (element.disabled) {
			state = "disabled";
		} else if (Chrome._activeThumb) {
			state = "active";
		} else if (element == Chrome._focus || (element == Chrome._hover && Chrome._hoverThumb)) {
			state = "hover";
		} else {
			state = "normal";
		}
    return this.states[state];
  },

  tick: function(element) {
    if (element.clientWidth >= element.clientHeight) { // horizontal
      var mx = Chrome._eventX;
      // _increasing is true, false or null
      if (mx < Chrome._thumbLeft && true != Chrome._increasing) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      } else if (mx > Chrome._thumbLeft + this.THUMB_WIDTH && false != Chrome._increasing) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      }
    } else { // vertical
      var my = Chrome._eventY;
      if (my < Chrome._thumbTop && false != Chrome._increasing) {
        this.increment(element, 1, true);
        Chrome._increasing = true;
      } else if (my > Chrome._thumbTop + this.THUMB_HEIGHT && true != Chrome._increasing) {
        this.increment(element, -1, true);
        Chrome._increasing = false;
      }
    }
    Chrome._firedOnce = true;
  }
});
