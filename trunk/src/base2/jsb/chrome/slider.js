
var slider = range.extend({
  // constants

  _HORIZONTAL_HEIGHT: 21,
  _VERTICAL_WIDTH: 22,
  _THUMB_SIZE: 11,
  _IMAGE_SIZE: 3000,

  "@Opera8": {
    _IMAGE_SIZE: 500
  },

  // properties

  appearance: "slider",
  //role: "slider",

  // events

  onmousedown: function(element, event, x, y, screenX, screenY) {
    this.base.apply(this, arguments);

    if (element.disabled) return;

    if (element.type == this.type) {
      event.preventDefault();
      if (element.readOnly) element.focus();
    }
    
    if (element.readOnly) return;

    // This is the behavior for Windows and Linux
    
    if (control._activeThumb) {
      var thumb = this.getThumbRect(element);
      slider._dragInfo = {
        dx: screenX - thumb.left,
        dy: screenY - thumb.top
      };
      slider._firedOnce = true;
      event.preventDefault();
    } else {
      this.startTimer(element);
      slider._value = this.getValueByPosition(element, x - this._THUMB_SIZE / 2, y - this._THUMB_SIZE / 2);
      slider._direction = slider._value < parseFloat(element.value) ? -1 : 1;
      if (element.type == this.type) {
        element.focus();
      }
      slider._firedOnce = false;
    }
  },

  onlosecapture: function(element) {
    delete slider._dragInfo;
    this.base(element);
  },

  onmouseup: function(element) {
    this.base.apply(this, arguments);
    if (!this.isEditable(element)) return;
    if (!slider._firedOnce) this.tick(element);
    this.stopTimer(element);
    delete slider._value;
    delete slider._direction;
    delete slider._firedOnce;
  },

  onmousemove: function(element, event, x, y, screenX, screenY) {
    if (slider._dragInfo) {
      this.setValueByPosition(element, screenX - slider._dragInfo.dx, screenY - slider._dragInfo.dy);
    } else {
      this.base.apply(this, arguments);
    }
  },

  /*"@Opera(8|9.[0-4])": { // prevent text selection for early versions of Opera
    onmousemove: function(element) {
      if (slider._dragInfo) {
        document.getSelection().collapse(element.ownerDocument.body, 0);
      }
      this.base.apply(this, arguments);
    }
  },*/

  // methods

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element == control._active && control._activeThumb) {
      state = "active";
    } else if (element == control._focus || (!element.readOnly && element == control._hover && control._hoverThumb)) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  getThumbRect: function(element) {
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT],
        relativeValue = this.getProperties(element).relativeValue;
    if (clientHeight > clientWidth) {
      return new Rect(
        (clientWidth - this._VERTICAL_WIDTH) / 2,
        (clientHeight -= this._THUMB_SIZE) - ~~(clientHeight * relativeValue),
        this._VERTICAL_WIDTH,
        this._THUMB_SIZE
      );
    } else {
      return new Rect(
        ~~((clientWidth - this._THUMB_SIZE) * relativeValue),
        ~~((clientHeight - this._HORIZONTAL_HEIGHT) / 2),
        this._THUMB_SIZE,
        this._HORIZONTAL_HEIGHT
      );
    }
  },

  getValueByPosition: function(element, x, y) {
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT],
        properties = this.getProperties(element);
    if (clientWidth >= clientHeight) {
      var size = clientWidth - this._THUMB_SIZE;
      var pos = x;
    } else {
      size = clientHeight - this._THUMB_SIZE;
      pos = size - y;
    }
    return (properties.max - properties.min) * (pos / size);
  },

  hitTest: function(element, x, y) {
    if (element.disabled || this.isNativeControl(element)) return null;
    return this.getThumbRect(element).contains(x, y);
  },

  layout: function(element, state) {
    if (state == null) state = this.getState(element);

    var thumb = this.getThumbRect(element),
        style = element.style,
        thumbOffset = Math.ceil((this._IMAGE_SIZE - this._THUMB_SIZE) / 2) + state * this._IMAGE_SIZE;

    if (element[_HEIGHT] > element[_WIDTH]) {
      var left = thumb.left,
          top = thumb.top - thumbOffset;
    } else {
      left = thumb.left - thumbOffset;
      top = thumb.top;
    }

    var backgroundPosition = left + PX + " " + top + PX;
    if (style.backgroundPosition != backgroundPosition) {
      style.backgroundPosition = backgroundPosition;
    }
  },

  setValueByPosition: function(element, x, y) {
    this.setValueAsNumber(element, this.getValueByPosition(element, x, y));
  },

  tick: function(element) {
    var properties = this.getProperties(element),
        amount = this.getBlockIncrement(element) * (properties.max - properties.min);
    if (Math.abs(slider._value - element.value) < amount) {
      this.setValueAsNumber(element, slider._value);
      this.stopTimer(element);
    } else {
      this.increment(element, slider._direction, true);
    }
    slider._firedOnce = true;
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
      if (!this.isEditable(element)) return;
      if (!control._activeThumb) {
        this.setValueByPosition(element, x - this._THUMB_SIZE / 2, y - this._THUMB_SIZE / 2);
      }
      this.base.apply(this, arguments); // why am I doing this twice?
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
