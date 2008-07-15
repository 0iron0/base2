
// For numeric controls

var Range = Chrome.modify({
  min:  "",
  max:  "",
  step: 1,

/*MASK: /-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/,*/

  onattach: function(element) {
    var properties = this.getProperties(element);
    // the following only applies to Slider/ProgressBar but we'll leave it here
    var value = element.value, min = properties.min;
    if (!value || isNaN(value)) value = min;
    //else if (_numberAttributes.step != 1) this.setValue(element, value);
    _values[element.base2ID] = (value - min) / (properties.max - min);
    element.onscroll = _resetScroll;
  },

  onmousewheel: function(element, event, delta) {
    if (this.isEditable(element) && Chrome._focus == element) {
      this.increment(element, -parseInt(delta / 40));
      event.preventDefault();
    }
  },

  getProperties: function(element) {
    // initialise min/max/step
    var properties = {min: this.min, max: this.max, step: this.step};
    for (var attr in properties) {
      var value = element[attr];
      if (value == null && element.hasAttribute && element.hasAttribute(attr)) {
        value = element.getAttribute(attr);
      }
      if (value && !isNaN(value)) {
        properties[attr] = value;
      }
    }
    return properties;
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
    return this.getProperty(element, "step") || 1;
  },

  getValue: function(element) {
    return parseFloat(element.value);
  },

  setValue: function(element, value) {
    var properties = this.getProperties(element);
    if (isNaN(value)) value = 0;
    var min = parseFloat(properties.min), max = parseFloat(properties.max), step = parseFloat(properties.step) || 1;
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
