
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range

// TODO: Right to left should invert horizontal

var _vertical = {};

var ProgressBar = NumberControl.extend({
  onfocus: function(element) {
    if (element != Chrome._active) Chrome._focus = element;
    //Chrome._focus = element;
    this.layout(element);
  },
  
  onmousedown: function(element, event) {
    base(this, arguments);
    event.preventDefault();
    if (Chrome._focus && element != Chrome._focus) {
      Chrome._focus.blur();
    }
  },
  
  "@MSIE": {
    onactivate: function(element) {
      if (undefined === this._readOnly) {
        this._readOnly = element.readOnly;
        element.readOnly = true;
      }
    },

    ondeactivate: function(element) {
      if (undefined !== this._readOnly) {
        element.readOnly = this._readOnly;
        delete this._readOnly;
      }
    }
  },

  onscroll: function(element) {
    alert(99);
    element.scrollTop = 0;
  }
}, {
  HEIGHT: 3000,
  WIDTH: 3000,
  CHUNK_WIDTH: 10,
  CHUNK_HEIGHT: 10,
  
  appearance: "progressbar",

  defaults: {
    min:  0,
    max:  100,
    step: 1
  },

  hitTest: False,

  getBlockIncrement: function(element) {
    // try to get as close as possible to 10% while still being a multiple
    // of the step and make sure that the block increment is not smaller than
    // twice the size of the unit increment
    var ui = this.getUnitIncrement(element);
    return Math.max(2 * ui, Math.round(0.1 / ui) * ui);
  },

  getUnitIncrement: function(element) {
    return element.step / (element.max - element.min) || this.base(element);
  },

  layout: function(element) {
		var clientWidth = element.clientWidth;
		var clientHeight = element.clientHeight;
		var base2ID = element.base2ID;
    if (clientWidth >= clientHeight) {
		  var chunk = chrome.theme.name == "luna" ? this.CHUNK_WIDTH : 1;
      var left = Math.floor(clientWidth * _values[base2ID]) - this.WIDTH;
      left = Math.round(++left / chunk) * chunk;
      var top = (-clientHeight / 2) * (clientHeight + 3) - 2;
      //var top = (-clientHeight / 2) * (clientHeight - 1);
      if (_vertical[base2ID]) this.setOrientation(element, this.HORIZONTAL);
    } else {
      left = (-clientWidth / 2) * (clientWidth + 3) - 2;
      top = Math.floor(clientHeight * _values[base2ID]);
      top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
      if (!_vertical[base2ID]) this.setOrientation(element, this.VERTICAL);
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  },

  getCursor: K(""),

  getValue: function(element) {
    return _values[element.base2ID];
  },

  setValue: function(element, value) {
    var min = Number(element.min), max = Number(element.max);
    this.base(element, min + (max - min) * value);
    _values[element.base2ID] = (element.value - min) / (max - min);
		this.layout(element);
  },

  resetScroll: function(element) {
    element.scrollTop = element.scrollHeight;
  },

  "@MSIE": {
    isEditable: function(element) {
      return !element.disabled && !this._readOnly;
    }
  }
});
