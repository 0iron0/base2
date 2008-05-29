
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range

// TODO: Right to left should invert horizontal

var ProgressBar = Range.modify({
  HEIGHT: 3000,
  WIDTH: 3000,
  CHUNK_WIDTH: 10,
  CHUNK_HEIGHT: 10,

  ATTRIBUTES: {
    min:  0,
    max:  100,
    step: 1
  },

  appearance: "progressbar",

  "@!theme=aqua": {
    onfocus: function(element) {
      if (element != Chrome._active) {
        this.addClass(element, this.appearance + _FOCUS);
      }
      this.base(element);
    }
  },
  
  onkeydown: function(element, event, keyCode) {
    //;;; console2.log("onkeydown: "+keyCode);
    if (!this.isEditable(element)) return;

    //event.preventDefault();

    if (keyCode < 33 || keyCode > 40) return;

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
    var attributes = this.getAttributes(element);
    return attributes.step / (attributes.max - attributes.min) || this.base(element);
  },

  layout: function(element) {
    var clientWidth = element.clientWidth;
    var clientHeight = element.clientHeight;
    var base2ID = element.base2ID;

    if (_vertical[base2ID]) {
      var left = (-clientWidth / 2) * (clientWidth + 3) - 2;
      //var left = (-clientWidth / 2) * (clientWidth - 1);
      var top = Math.floor(clientHeight * _values[base2ID]);
      top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
    } else {
      var chunk = /luna/.test(chrome.theme) ? this.CHUNK_WIDTH : 1;
      left = Math.floor(clientWidth * _values[base2ID]) - this.WIDTH;
      left = Math.round(++left / chunk) * chunk;
      top = (-clientHeight / 2) * (clientHeight + 3) - 2;
      //top = (-clientHeight / 2) * (clientHeight - 1);
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  },

  getCursor: K(""),

  getValue: function(element) {
    return _values[element.base2ID];
  },

  setValue: function(element, value) {
    var attributes = this.getAttributes(element);
    var min = Number(attributes.min), max = Number(attributes.max);
    this.base(element, min + (max - min) * value);
    _values[element.base2ID] = (element.value - min) / (max - min);
    this.layout(element);
  }
});
