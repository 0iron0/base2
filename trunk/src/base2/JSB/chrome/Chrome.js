
var _timers = {}; // store for timeouts

var Chrome = MouseCapture.extend({
  oncontentready: function(element) {
    this.layout(element, this.states[element.disabled ? "disabled" : "normal"]);
  },

  onmousedown: function(element, event, x, y) {
    Chrome._active = element;
    
    if (!this.isEditable(element)) return;

    Chrome._activeThumb = this.hitTest(element, x, y);
    this.syncCursor(element);
    this.layout(element);
    if (Chrome._activeThumb) {
      this.setCapture(element);
    }
  },

  onmouseup: function(element) {
    if (Chrome._activeThumb) {
      delete Chrome._activeThumb;
      this.syncCursor(element);
      this.layout(element);
    }
    this.releaseCapture(element);
    delete Chrome._active;
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

  onfocus: function(element) {
    Chrome._focus = element;
    this.layout(element);
  },

  onblur: function(element) {
    delete Chrome._focus;
    this.layout(element);
  },

/*  onresize: function(element) {
    this.layout(element);
  },

  onscroll: function(element) {
    this.resetScroll(element);
  }, */

  setAttribute: function(element, name, value) {
    HTMLElement.setAttribute(element, name, value);
    if (/^(disabled|readonly)$/.test(name.toLowerCase())) {
      this.layout(element);
    }
  }
}, {
  states: {
    normal:   0,
    hover:    1,
    active:   2,
    disabled: 3,
    length:   4
  },
  
  imageWidth: 17,

  isActive: function(element) {
    return Chrome._hover == element && Chrome._activeThumb && (Chrome._activeThumb == Chrome._hoverThumb);
  },

  isEditable: function(element) {
    return !element.disabled && !element.readOnly;
  },

  isNativeControl: False,
  
  getBoundingClientRect: function(element) {
    var left = element.offsetLeft;
    var top = element.offsetTop;
    return {
      top: top,
      right: left + element.clientWidth,
      bottom: top + element.clientHeight,
      left: left
    };
  },

  "@(document.getBoxObjectFor)": {
    getBoundingClientRect: function(element) {
      var box = document.getBoxObjectFor(element);
      return {
        top: box.y,
        right: box.x + box.width,
        bottom: box.y + box.height,
        left: box.x
      };
    }
  },

  "@(element.getBoundingClientRect)": {
    getBoundingClientRect: function(element) {
      return element.getBoundingClientRect();
    }
  },

  getCursor: function(element) {
    return Chrome._hover == element && (Chrome._activeThumb || Chrome._hoverThumb) ? "default" : "";
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

	startTimer: function(element, id) {
    id = element.base2ID + (id || "_timer");
		if (!_timers[id]) {
		  var self = this;
			_timers[id] = setInterval(function() {
        self.tick(element);
      }, 100);
		}
	},

	stopTimer: function(element, id) {
    id = element.base2ID + (id || "_timer");
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
  
/*  resetScroll: function(element) {
    element.scrollLeft = element.scrollWidth;
  } */
});
