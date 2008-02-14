
var Spinner = NumberControl.extend({
  "@--opera[91]": {
    oncontentready: function(element) {
      if (element.nodeName == "INPUT" && element.type != "number") {
        element.type = "number";
      }
    }
  },
  
  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;

    switch (keyCode) {
      case 35: // end
        if (element.max) this.setValue(element, element.max);
        event.preventDefault();
        break;
      case 36: // home
        if (element.max) this.setValue(element, element.min);
        event.preventDefault();
        break;
      case 38: // up-arrow
        this.activate(element, "up");
        event.preventDefault();
        break;
      case 40: // down-arrow
        this.activate(element, "down");
        event.preventDefault();
        break;
      case 33: // page-up
        this.activate(element, "up", true);
        event.preventDefault();
        break;
      case 34: // page-down
        this.activate(element, "down", true);
        event.preventDefault();
        break;
    }
  },

  onkeyup: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    
    this.stopTimer(element);

    switch (keyCode) {
      case 33: // page-up
      case 34: // page-down
      case 38: // up-arrow
      case 40: // down-arrow
        event.preventDefault();
        this.deactivate(element);
        break;
    }
  },

  onmousedown: function(element) {
    base(this, arguments);
    if (Chrome._activeThumb) {
      this.startTimer(element);
    }
  },

  onmouseup: function(element, event) {
    this.stopTimer(element);
    // call afterward because we don't want to clear the state yet
    this.base(element, event);
  },

  ondblclick: function(element) {
    if (Chrome._hoverThumb != null) {
      // IE does not fire down/up for dblclicks
      this.increment(element);
    }
  }
}, {
  appearance: "spinner",
  
  states: {
    normal:      0,
    up_hover:    1,
    up_active:   2,
    down_hover:  3,
    down_active: 4,
    disabled:    5,
    length:      6
  },

  "@opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "number";
    }
  },

  activate: function(element, direction, block) {
		if (!_timers[element.base2ID + "_active"]) {
      Chrome._activeThumb = Chrome._hoverThumb = direction;
      this.layout(element);
      Chrome._block = block;
      this.startTimer(element, "_active");
    }
  },

  deactivate: function(element) {
		if (_timers[element.base2ID + "_active"]) {
      this.stopTimer(element, "_active");
      delete Chrome._activeThumb;
      delete Chrome._hoverThumb;
      delete Chrome._block;
      this.layout(element);
    }
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if (element == Chrome._hover && Chrome._activeThumb) {
      state = Chrome._activeThumb + "_active";
    } else if (element == Chrome._hover && Chrome._hoverThumb) {
      state = Chrome._hoverThumb + "_hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  hitTest: function(element, x, y) {
    if (!this.base(element, x)) return null;
    return y <= (element.clientHeight / 2) ? "up" : "down";
  },

  startTimer: function(element) {
		if (!_timers[element.base2ID + "_timer"]) {
      Chrome._direction = (Chrome._activeThumb == "up") ? 1 : -1;
      Chrome._steps = 1;
      this.base(element);
    }
  },

  stopTimer: function(element) {
		if (_timers[element.base2ID + "_timer"]) {
      this.base(element);
      if (!Chrome._firedOnce) this.increment(element);
      delete Chrome._firedOnce;
      element.select();
    }
  },

  tick: function(element) {
    this.increment(element);
    Chrome._steps *= 1.1; // accelerate
  },

  increment: function(element, amount, block) {
    if (amount == undefined) {
      amount = parseInt(Chrome._steps * Chrome._direction);
      block = Chrome._block;
    }
    this.base(element, amount, block);
    Chrome._firedOnce = true;
  }
});
