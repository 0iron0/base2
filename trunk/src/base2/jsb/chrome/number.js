
// For numeric controls

var number = {
  // properties
  
  min:  "",
  max:  "",
  step: 1,
  value: 0,
  stepScale: 1,

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

  /*onchange: function(element) {
    // allow values like "5+6" and "15 * 33"
    this.removeClass(element, "jsb-error");
    var value = element.value;
    if (isNaN(value)) {
      try {
        value = (new Function(
          'with(Math){var e=E,pi=PI; return ' + value + '}'
        ))();
        this.setValue(element, value);
        element.scrollLeft = 9999;
      } catch(ex) {
        this.addClass(element, "jsb-error");
      }
    }
  },*/

  onmousewheel: function(element, event, delta) {
    if (this.isEditable(element) && control._focus == element && element.value != "") {
      this.increment(element, parseInt(delta / 120));
      event.preventDefault();
    }
  },

  // methods

  convertValueToNumber: parseFloat,
  convertNumberToValue: String,

  getValueAsNumber: function(element) {
    return this.convertValueToNumber(element.value);
  },

  setValueAsNumber: function(element, value) {
    if (isNaN(value)) value = this.value;
    var properties = this.getProperties(element),
        min = this.convertValueToNumber(properties.min),
        max = this.convertValueToNumber(properties.max),
        step = parseFloat(properties.step) || 1,
        scale = step * this.stepScale;
    // check min/max
    value = value > max ? max : value < min ? min : value;
    value = Math.round(value / step) * step;
    if (scale < 1) value = value.toFixed(String(step).replace(/^.*\.|^\d+$/, "").length);
    // round to step
    this.setValue(element, this.convertNumberToValue(value));
  },

  getProperties: function(element) {
    if (element == number._element) {
      var properties = number._properties;
    } else {
      number._element = element;
      properties = number._properties = {min: 0, max: 0, step: 0};
      for (var attr in properties) {
        properties[attr] = this.get(element, attr);
      }
    }
    return properties;
  },

  increment: function(element, amount, block) {
    var type = block ? "Block" : "Unit";
    amount *= this["get" + type + "Increment"](element);
    this.setValueAsNumber(element, this.getValueAsNumber(element) + amount);
  },

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 10 * this.stepScale;
  },

  getUnitIncrement: function(element) {
    return (this.get(element, "step") || 1) * this.stepScale;
  }
};
