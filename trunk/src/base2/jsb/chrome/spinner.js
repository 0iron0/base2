
var spinner = number.extend({

  // constants

  states: {
    normal:      0,
    up_hover:    1,
    up_active:   2,
    down_hover:  3,
    down_active: 4,
    disabled:    5,
    length:      6
  },

  // properties

  // events
  
  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element)) return;
    
    if (!/^(3[348]|40)$/.test(keyCode)) return; // valid key codes

    event.preventDefault();

    switch (keyCode) {
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
    
    if (!/^(3[348]|40)$/.test(keyCode)) return; // valid key codes
    
    this.stopTimer(element);

    this.deactivate(element);
  },

  onmousedown: function(element) {
    this.base.apply(this, arguments);
    if (control._activeThumb) {
      this.startTimer(element);
    }
  },

  onmouseup: function(element, event) {
    this.stopTimer(element);
    // call afterward because we don't want to clear the state yet
    this.base(element, event);
  },

  // methods

  activate: function(element, direction, block) {
    control._activeThumb = control._hoverThumb = direction;
    this.layout(element);
    control._block = block;
    this.startTimer(element, _ACTIVE);
  },

  deactivate: function(element) {
    this.stopTimer(element, _ACTIVE);
    delete control._activeThumb;
    delete control._hoverThumb;
    delete control._block;
    this.layout(element);
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if ((element == control._hover || element == control._focus) && control._activeThumb) {
      state = control._activeThumb + _ACTIVE;
    } else if (element == control._hover && control._hoverThumb) {
      state = control._hoverThumb + _HOVER;
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  hitTest: function(element, x, y) {
    if (!this.base(element, x)) return null;
    return y <= (element[_HEIGHT] / 2) ? "up" : "down";
  },

  startTimer: function(element) {
    if (!_timers[element.uniqueID + _TIMER]) {
      control._direction = (control._activeThumb == "up") ? 1 : -1;
      control._steps = 1;
      this.base(element);
    }
  },

  stopTimer: function(element) {
    if (_timers[element.uniqueID + _TIMER]) {
      this.base(element);
      if (!control._firedOnce) this.increment(element);
      delete control._firedOnce;
      element.select();
    }
  },

  tick: function(element) {
    this.increment(element);
    control._steps *= 1.1; // accelerate
  },

  increment: function(element, amount, block) {
    if (amount == undefined) {
      amount = parseInt(control._steps * control._direction);
      block = !!control._block;
    }
    this.base(element, amount, block);
    control._firedOnce = true;
  },

  "@Opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "number";
    }
  },
  
  "@MSIE.+win": _MSIEShim
});

