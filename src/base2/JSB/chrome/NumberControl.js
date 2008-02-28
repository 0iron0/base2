
var NumberControl = Chrome.extend({
  onattach: function(element) {
    var attributes = this.getAttributes(element);
    // the following only applies to Slider/ProgressBar but we'll leave it here
    var value = element.value, min = attributes.min;
    if (!value || isNaN(value)) value = min;
    //else if (_numberAttributes.step != 1) this.setValue(element, value);
    _values[element.base2ID] = (value - min) / (attributes.max - min);
    element.onscroll = _resetScroll;
  },

  onmousewheel: function(element, event, delta) {
    if (this.isEditable(element) && Chrome._focus == element) {
      this.increment(element, -parseInt(delta / 40));
      event.preventDefault();
    }
  }
}, {
  ATTRIBUTES: {
    min:  "",
    max:  "",
    step: 1
  },

  mask: /-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/,

  getAttributes: function(element) {
    // initialise min/max/step
    var attributes = {};
    for (var attr in this.ATTRIBUTES) {
      var value = element[attr];
      if (value == null && element.hasAttribute && element.hasAttribute(attr)) {
        value = element.getAttribute(attr);
      }
      if (!value || isNaN(value)) value = this.ATTRIBUTES[attr];
      attributes[attr] = value;
    }
    return attributes;
  },

  increment: function(element, amount, block) {
    var type = block ? "Block" : "Unit";
    amount *= this["get" + type + "Increment"](element);
    this.setValue(element, this.getValue(element) + amount);
  },

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 10;
  },

  getUnitIncrement: function(element) {
    return this.getAttributes(element).step || 1;
  },

  getValue: function(element) {
    return parseFloat(element.value);
  },

  setValue: function(element, value) {
    var attributes = this.getAttributes(element);
    if (isNaN(value)) value = 0;
    var min = parseFloat(attributes.min), max = parseFloat(attributes.max), step = parseFloat(attributes.step) || 1;
    // check min/max
    value = value > max ? max : value < min ? min : value;
    // round to step
    value = Math.round(value / step) * step;
    value = value.toFixed(String(step).replace(/^.*\.|^\d+$/, "").length);
    if (value != element.value) {
      element.value = value;
      this.dispatchEvent(element, "change");
    }
  }
});
