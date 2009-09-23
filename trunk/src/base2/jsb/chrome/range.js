
var range = control.extend({
  "implements": [number],

  // constants

  _IMAGE_SIZE: 3000,

  "@Opera8": {
    _IMAGE_SIZE: 2000
  },
  
  // properties
  
  min:  "0",
  max:  "100",
  
  allowVertical: true,
  type: "range", // web forms 2.0 type

  // events

  "@MSIE(5.5|[^5])": _preventScroll,

  onpropertyset: function(element, event, propertyName) {
    if (/^(max|min|step|value)$/.test(propertyName)) {
      this.layout(element);
    } else {
      this.base(element, event, propertyName);
    }
  },

  "@!theme=aqua": {
    onfocus: function(element, event) {
      if (element != control._active) {
        this.addClass(element, this.appearance + _FOCUS);
      }
      this.base(element, event);
    }
  },

  onkeydown: function(element, event, keyCode, shiftKey, ctrlKey, altKey, metaKey) {
    if (!this.isEditable(element) || keyCode < 33 || shiftKey || ctrlKey || altKey || metaKey) return;

    event.preventDefault();
    
    if (keyCode > 40) return;

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

  getProperties: function(element) {
    var properties = this.base(element);
    properties.relativeValue = ((properties.value = parseFloat(element.value) || 0) - properties.min) / (properties.max - properties.min);
    return properties;
  },

  getRelativeValue: function(element) {
    return this.getProperties(element).relativeValue;
  },

  setRelativeValue: function(element, relativeValue) {
    var properties = this.getProperties(element);
    this.setValueAsNumber(element, (properties.max - properties.min) * relativeValue);
  },

  getValidValue: function(element, value, round) {
    return this.base(element, value, round || "round");
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
