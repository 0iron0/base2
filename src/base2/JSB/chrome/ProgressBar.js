
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range

// TODO: Right to left should invert horizontal

var _vertical = {};

var ProgressBar = NumberControl.extend({
  onfocus: function(element) {
    if (Chrome._active != element) Chrome._focus = element;
    //Chrome._focus = element;
    this.layout(element);
  },
  
  onmousedown: function(element, event, x, y, screenX, screenY) {
    this.base(element, event, x, y);
    event.preventDefault();
    if (Chrome._focus && Chrome._focus != element) {
      Chrome._focus.blur();
    }
  }
}, {
  HEIGHT: 3000,
  WIDTH: 3000,
  CHUNK_WIDTH: 10,
  CHUNK_HEIGHT: 10,
  HORIZONTAL: 0,
  VERTICAL: 1,
  
  defaults: {
    min:  0,
    max:  100,
    step: 1
  },
  
  image: "progressbar",

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
		  var chunk = chrome.theme.name == "royale" ? 1 : this.CHUNK_WIDTH;
      var left = Math.floor(clientWidth * _values[base2ID]) - this.WIDTH;
      left = Math.round(++left / chunk) * chunk;
      var top = (-clientHeight / 2) * (clientHeight + 3) - 2;
      if (_vertical[base2ID]) this.setOrientation(element, this.HORIZONTAL);
    } else {
      left = (-clientWidth / 2) * (clientWidth + 3) - 2;
      top = Math.floor(clientHeight * _values[base2ID]);
      top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
      if (!_vertical[base2ID]) this.setOrientation(element, this.VERTICAL);
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  },

  setOrientation: function(element, orientation) {
    if (orientation == this.VERTICAL) {
      _vertical[element.base2ID] = true;
      this.setCSSProperty(element, "background-image", "url(" + chrome.theme + this.image + "-vertical.png)", true);
    } else {
      delete _vertical[element.base2ID];
      element.style.backgroundImage = "";
    }
  },

  getCursor: K("default"),

  getValue: function(element) {
    return _values[element.base2ID];
  },

  setValue: function(element, value) {
    var min = Number(element.min), max = Number(element.max);
    this.base(element, min + (max - min) * value);
    _values[element.base2ID] = (element.value - min) / (max - min);
		this.layout(element);
  }
});
