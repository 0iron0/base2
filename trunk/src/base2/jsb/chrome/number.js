
// For numeric controls

var number = control.extend({
  // properties
  
  min:  "",
  max:  "",
  step: 1,
  value: 0,

  "@Opera": {
    get: function(element, propertyName) {
      var value = this.base(element, propertyName);
      switch (propertyName) {
        case "min":
        case "max":
        case "step":
          if (value === "") return this[propertyName];
      }
      return value;
    }
  },

  // events

  onchange: function(element) {
    // allow values like "5+6" and "15 * 33"
    this.removeClass(element, "chrome-error");
    var _value = element.value;
    if (isNaN(_value)) {
      try {
        eval("_value=" + _value);
        this.setValue(element, _value);
      } catch(ex) {
        this.addClass(element, "chrome-error");
      }
    }
  },

  onmousewheel: function(element, event, delta) {
    if (this.isEditable(element) && control._focus == element) {
      this.increment(element, parseInt(delta / 120));
      event.preventDefault();
    }
  },

  // methods

  getProperties: function(element) {
    var properties = range._properties;
    if (element != range._element) {
      range._element = element;
      properties = range._properties = {min: 0, max: 0, step: 0};
      for (var attr in properties) {
        properties[attr] = this.get(element, attr);
      }
    }
    properties.relativeValue = ((properties.value = parseFloat(element.value) || 0) - properties.min) / (properties.max - properties.min);
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
    return this.get(element, "step") || 1;
  },

  getValue: function(element) {
    return parseFloat(element.value);
  },

  setValue: function(element, value) {
    value = parseFloat(value);
    if (isNaN(value)) value = this.value;
    var properties = this.getProperties(element);
    var min = parseFloat(properties.min), max = parseFloat(properties.max), step = parseFloat(properties.step) || 1;
    // check min/max
    value = value > max ? max : value < min ? min : value;
    // round to step
    value = Math.round(value / step) * step;
    value = value.toFixed(String(step).replace(/^.*\.|^\d+$/, "").length);
    if (value != element.value) {
      element.value = value;
      this.dispatchEvent(element, "change");
      this.layout(element);
    }
  }
});
