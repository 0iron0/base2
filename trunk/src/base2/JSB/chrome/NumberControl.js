
var NumberControl = Chrome.extend({
  onattach: function(element) {
    // initialise min/max/step
		for (var attr in _numberDefaults) {
  		var value = element[attr];
  		if (value === 0 || (value && !isNaN(value))) continue;
  		if (!value && element.hasAttribute && element.hasAttribute(attr)) {
        value = element.getAttribute(attr);
  		}
  		if (!value || isNaN(value)) value = this[attr];
      element[attr] = value;
		}
    // the following only applies to Slider/ProgressBar but we'll leave it here
		var min = element.min, value = element.value;
    if (!value || isNaN(value)) value = min;
    //else if (element.step != 1) this.setValue(element, value);
    _values[element.base2ID] = (value - min) / (element.max - min);
    
    element.onscroll = _resetScroll;

    // default behaviour
    this.base(element);
  },

  onmousewheel: function(element, event, delta) {
    if (this.isEditable(element) && Chrome._focus == element) {
      this.increment(element, -parseInt(delta / 40));
      event.preventDefault();
    }
  }
}, {
  min:  "",
  max:  "",
  step: 1,
  
  mask: /-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/,

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
    if (isNaN(value)) value = 0;
    //console2.log(value);
    var min = parseFloat(element.min), max = parseFloat(element.max), step = parseFloat(element.step) || 1;
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
