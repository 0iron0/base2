
var slider = range.extend({
  // constants
  
  HORIZONTAL_WIDTH: 3000,
  HORIZONTAL_HEIGHT: 21,
  VERTICAL_WIDTH: 22,
  VERTICAL_HEIGHT: 3000,
  THUMB_WIDTH: 11,
  THUMB_HEIGHT: 11,

  // properties

  appearance: "slider",

  // events

  onmousedown: function(element, event, x, y, screenX, screenY) {
    this.base.apply(this, arguments);
    event.preventDefault();
    if (!this.isEditable(element)) return;
    if (control._activeThumb) {
      var thumb = this.getThumbRect(element);
      control._dragInfo = {
        dx: screenX - thumb.left,
        dy: screenY - thumb.top
      };
      control._firedOnce = true;
    } else {
      this.startTimer(element);
      slider._value = this.getValueByPosition(element, x - this.THUMB_WIDTH / 2, y - this.THUMB_HEIGHT / 2);
      slider._direction = slider._value < this.getValue(element) ? -1 : 1;
    }
    element.focus();
  },

  onmouseup: function(element, event) {
    this.base(element, event);
    delete control._dragInfo;
    if (!control._firedOnce) this.tick(element);
    this.stopTimer(element);
    delete control._value;
    delete control._direction;
    delete control._firedOnce;
  },

  onmousemove: function(element, event, x, y, screenX, screenY) {
    if (control._dragInfo) {
      this.setValueByPosition(element, screenX - control._dragInfo.dx, screenY - control._dragInfo.dy);
    } else {
      this.base.apply(this, arguments);
    }
  },

  "@Opera(8|9.[0-4])": {
    onmousemove: function(element) {
      if (control._dragInfo) {
        getSelection().collapse(element.ownerDocument.body, 0); // prevent text selection
      }
      this.base.apply(this, arguments);
    }
  },

  // methods

  layout: function(element, state) {
    if (state == null) state = this.getState(element);
    
    var thumb = this.getThumbRect(element);

    if (element[_HEIGHT] > element[_WIDTH]) {
      var left = thumb.left;
      var top = thumb.top - Math.ceil((this.VERTICAL_HEIGHT - this.THUMB_HEIGHT) / 2) - state * this.VERTICAL_HEIGHT;
    } else {
      left = thumb.left - Math.ceil((this.HORIZONTAL_WIDTH - this.THUMB_WIDTH) / 2) - state * this.HORIZONTAL_WIDTH;
      top = thumb.top;
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  },

  getThumbRect: function(element) {
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT],
        relativeValue = this.getProperties(element).relativeValue;
    if (clientHeight > clientWidth) {
      return new Rect(
        (clientWidth - this.VERTICAL_WIDTH) / 2,
        (clientHeight -= this.THUMB_HEIGHT) - Math.floor(clientHeight * relativeValue),
        this.VERTICAL_WIDTH,
        this.THUMB_HEIGHT
      );
    } else {
      return new Rect(
        Math.floor((clientWidth - this.THUMB_WIDTH) * relativeValue),
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

  getValueByPosition: function(element, x, y) {
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT],
        properties = this.getProperties(element);
    if (clientWidth >= clientHeight) {
      var size = clientWidth - this.THUMB_WIDTH;
      var pos = x;
    } else {
      size = clientHeight - this.THUMB_HEIGHT;
      pos = size - y;
    }
    return (properties.max - properties.min) * (pos / size);
  },

  setValueByPosition: function(element, x, y) {
    this.setValue(element, this.getValueByPosition(element, x, y));
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element == control._active && control._activeThumb) {
      state = "active";
    } else if (element == control._focus || (element == control._hover && control._hoverThumb)) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  tick: function(element) {
    var properties = this.getProperties(element);
    var amount = this.getBlockIncrement(element) * (properties.max - properties.min);
    if (Math.abs(slider._value - this.getValue(element)) < amount) {
      this.setValue(element, slider._value);
      this.stopTimer(element);
    } else {
      this.increment(element, slider._direction, true);
    }
    control._firedOnce = true;
  },

  "@KHTML|Opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.type == "range";
    }
  },

  "@theme=aqua": {
    onblur: function(element, event) {
      if (element == slider._activeElement) {
        delete slider._activeElement;
      }
      this.base(element, event);
    },
    
    // the aqua slider jumps immediatley to wherever you click

    onmousedown: function(element, event, x, y) {
      slider._activeElement = element;
      this.base.apply(this, arguments);
      if (!control._activeThumb) {
        this.setValueByPosition(element, x - this.THUMB_WIDTH / 2, y - this.THUMB_HEIGHT / 2);
      }
      this.base.apply(this, arguments);
    },

    getState: function(element) {
      if (element.disabled) {
        var state = "disabled";
      } else if (element == control._active && control._activeThumb) {
        state = "active";
      } else if (element == control._focus && element != slider._activeElement) {
        state = "hover";
      } else {
        state = "normal";
      }
      return this.states[state];
    },

    startTimer: Undefined
  }
});
