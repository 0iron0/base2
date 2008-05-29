
var Spinner = Range.modify({
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
  
  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    if (!/^(3[34568]|40)$/.test(keyCode)) return;

    event.preventDefault();

    switch (keyCode) {
      case 35: // end
        if (element.max) this.setValue(element, element.max);
        return;
      case 36: // home
        if (element.min) this.setValue(element, element.min);
        return;
      case 34: // page-down
        var block = true;
        break;
      case 33: // page-up
        block = true;
      case 38: // up-arrow
        var direction = "up";
    }
    this.activate(element, direction || "down", block);
  },

  onkeyup: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    
    this.stopTimer(element);

    switch (keyCode) {
      case 33: // page-up
      case 34: // page-down
      case 38: // up-arrow
      case 40: // down-arrow
        event.preventDefault(); // is this required?
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

  "@opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "number";
    }
  },

  activate: function(element, direction, block) {
    Chrome._activeThumb = Chrome._hoverThumb = direction;
    this.layout(element);
    Chrome._block = block;
    this.startTimer(element, _ACTIVE);
  },

  deactivate: function(element) {
    this.stopTimer(element, _ACTIVE);
    delete Chrome._activeThumb;
    delete Chrome._hoverThumb;
    delete Chrome._block;
    this.layout(element);
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if ((element == Chrome._hover || element == Chrome._focus) && Chrome._activeThumb) {
      state = Chrome._activeThumb + _ACTIVE;
    } else if (element == Chrome._hover && Chrome._hoverThumb) {
      state = Chrome._hoverThumb + _HOVER;
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
    if (!_timers[element.base2ID + _TIMER]) {
      Chrome._direction = (Chrome._activeThumb == "up") ? 1 : -1;
      Chrome._steps = 1;
      this.base(element);
    }
  },

  stopTimer: function(element) {
    if (_timers[element.base2ID + _TIMER]) {
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
      block = !!Chrome._block;
    }
    this.base(element, amount, block);
    Chrome._firedOnce = true;
  }
});
