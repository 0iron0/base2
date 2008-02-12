
var _values = {}; // store for computed values

var NumberControl = Chrome.extend({
  oncontentready: function(element) {
    // initialise min/max/step
		for (var attr in this.defaults) {
  		var value = element[attr];
  		if (value === 0 || (value && !isNaN(value))) continue;
  		if (!value && element.hasAttribute && element.hasAttribute(attr)) {
        value = element.getAttribute(attr);
  		}
  		if (!value || isNaN(value)) value = this.defaults[attr];
      element[attr] = value;
		}

    // the following only applies to Slider/ProgressBar but we'll leave it here
		var min = element.min, value = element.value;
    if (!value || isNaN(value)) value = min;
    _values[element.base2ID] = (value - min) / (element.max - min);

    // default behaviour
    this.base(element);
  },
  
  onmousewheel: function(element, event) {
    if (Chrome._active == element && this.isEditable(element)) {
      this.increment(element, parseInt(event.wheelDelta / 120));
      event.preventDefault();
    }
  },
  
  setAttribute: function(element, name, value) {
    this.base(element, name, value);
    if (/^(min|max|step|value)$/.test(name.toLowerCase())) {
      this.layout(element);
    }
  }
}, {
  defaults: {
    min:  "",
    max:  "",
    step: 1
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
    return element.step || 1;
  },

  getValue: function(element) {
    return parseFloat(element.value);
  },

  setValue: function(element, value) {
    var min = parseFloat(element.min), max = parseFloat(element.max), step = parseFloat(element.step) || 1;
    // check min/max
    value = value > max ? max : value < min ? min : value;
    // round to step
    value = Math.round(value / step) * step;
    if (value != element.value) {
      element.value = value;
      this.dispatchEvent(element, "change");
    }
  }
});
