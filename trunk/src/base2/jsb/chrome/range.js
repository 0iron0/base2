
var range = number.extend({
  // properties
  
  min:  0,
  max:  100,
  allowVertical: true,

  // events

  onminchange: _range_layout,
  onmaxchange: _range_layout,
  onstepchange: _range_layout,
  onvaluechange: _range_layout,

  "@!Opera(8|9.[0-4])": {
    // The text is hidden for all but Opera < 9.5.
    // So disallow the default number behavior.
    onchange: Undefined
  },

  "@MSIE": _preventScroll,

  "@!theme=aqua": {
    onfocus: function(element) {
      if (element != control._active) {
        this.addClass(element, this.appearance + _FOCUS);
      }
      this.base(element);
    }
  },

  onkeydown: function(element, event, keyCode) {
    if (!this.isEditable(element) || keyCode < 33 || keyCode > 40) return;

    event.preventDefault();

    var amount = 1;

    switch (keyCode) {
      case 35: // end
        var value = 1;
      case 36: // home
        this.setRelativeValue(element, value || 0);
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

  // methods

  getRelativeValue: function(element) {
    return this.getProperties(element).relativeValue;
  },

  setRelativeValue: function(element, relativeValue) {
    var properties = this.getProperties(element);
    this.setValue(element, (properties.max - properties.min) * relativeValue);
  },

  increment: function(element, amount, block) {
    var type = block ? "Block" : "Unit";
    amount *= this["get" + type + "Increment"](element);
    this.setRelativeValue(element, this.getRelativeValue(element) + amount);
  },

  getBlockIncrement: function(element) {
    // try to get as close as possible to 10% while still being a multiple
    // of the step and make sure that the block increment is not smaller than
    // twice the size of the unit increment
    var ui = this.getUnitIncrement(element);
    return Math.max(2 * ui, Math.round(0.1 / ui) * ui);
  },

  getUnitIncrement: function(element) {
    var properties = this.getProperties(element);
    return properties.step / (properties.max - properties.min) || this.base(element);
  },

  getCursor: K("")
});

function _range_layout(element) {
  this.layout(element);
};
