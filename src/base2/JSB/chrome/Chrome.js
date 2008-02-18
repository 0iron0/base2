
var Chrome = MouseCapture.extend({
  onattach: function(element) {
    this.layout(element, this.states[element.disabled ? "disabled" : "normal"]);
  },

  onmousedown: function(element, event, x, y) {
    console2.log("onmousedown: "+ event.button);
    Chrome._active = element;
    
    if (!this.isEditable(element)) return;

    Chrome._activeThumb = this.hitTest(element, x, y);
    if (Chrome._activeThumb) {
      this.setCapture(element);
    }
    this.syncCursor(element);
    this.layout(element);
  },

  onmouseup: function(element, event) {
    console2.log("onmouseup: "+ event.button);
    delete Chrome._active;
    if (Chrome._activeThumb) {
      delete Chrome._activeThumb;
      this.syncCursor(element);
      this.layout(element);
    }
    this.releaseCapture(element);
  },

  onmousemove: function(element, event, x, y) {
    Chrome._hoverThumb = this.hitTest(element, x, y);
    this.delayRefresh(element);
  },

  onmouseover: function(element) {
    Chrome._hover = element;
    this.delayRefresh(element);
  },

  onmouseout: function(element) {
    delete Chrome._hoverThumb;
    delete Chrome._hover;
    this.delayRefresh(element);
  },

  onfocus: function(element, event) {
    console2.log("onfocus");
    Chrome._focus = element;
    this.layout(element);
  },

  onblur: function(element) {
    console2.log("onblur");
    delete Chrome._focus;
    this.removeClass(element, this.appearance + _FOCUS);
    this.layout(element);
  },

  onkeyup: function(element, event, keyCode) {
    console2.log("onkeyup: "+keyCode);
  },

  onkeypress: function(element, event, keyCode) {
    console2.log("onkeypress: "+keyCode);
  },

  onclick: function(element, event) {
    console2.log("onclick: "+ event.button);
  },

  ondblclick: function(element, event) {
    console2.log("ondblclick: "+ event.button);
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
      this.setCSSProperty(element, "background-image", "url(" + chrome.theme + this.appearance + "-vertical.png)", true);
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

  delayRefresh: function(element) {
    // use a timer delay to prevent excess mouse movement
    //  from causing cursor flicker (hourglass)
    var id = element.base2ID + "_delay";
    if (!_timers[id]) {
      var self = this;
      _timers[id] = setTimeout(function() {
        self.syncCursor(element);
        self.layout(element);
        delete _timers[id];
      }, 50);
    }
  },

  layout: function(element, state) {
    if (state == null) state = this.getState(element);
    var clientHeight = element.clientHeight;
    var top = - this.states.length * (clientHeight / 2 * (clientHeight - 1));
    top -= clientHeight * state;
    element.style.backgroundPosition = "right " + top + PX;
  },

  handleEvent: function(element, event) {
    if (!this.isNativeControl(element)) {
      this.base(element, event);
    }
  }
});
