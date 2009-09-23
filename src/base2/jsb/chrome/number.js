
// For numeric controls

var number = {
  // properties

  baseValue: 0,
  block: 10,
  max:  "",
  min:  "",
  step: "1",
  stepScale: 1,

  "@(hasFeature('WebForms','2.0'))": {
    get: function(element, propertyName) {
      // if the control is bound to a <input type=text> we need to ignore
      // the default min/max/step properties (empty string)
      var value = this.base(element, propertyName);
      if (element.type == "text" && /^(max|min|step)$/.test(propertyName)) {
          if (value === "") return this[propertyName];
      }
      return value;
    }
  },

  // events

  onchange: function(element) {
    this.setAttribute(element, "aria-valuenow", element.value);
    if (element.value == "" || this.isValid(element)) {
      this.removeClass(element, "jsb-error");
      this.removeAttribute(element, "aria-invalid");
    } else {
      this.addClass(element, "jsb-error");
      this.setAttribute(element, "aria-invalid", true);
    }
  },

  onmousewheel: function(element, event, wheelDelta) {
    if (this.isEditable(element) && control._focus == element) {
      this.increment(element, ~~(wheelDelta / 120));
      event.preventDefault();
    }
  },

  // methods

  convertValueToNumber: parseFloat,
  convertNumberToValue: String,

  getDefaultValue: K(0),

  getValueAsNumber: function(element) {
    return this.convertValueToNumber(element.value);
  },

  setValueAsNumber: function(element, value) {
    this.setValue(element, this.convertNumberToValue(this.getValidValue(element, value)));
  },

  getValidValue: function(element, value, round) {
    if (isNaN(value)) value = this.getDefaultValue();
    var properties = this.getProperties(element),
        min = properties.min,
        max = properties.max,
        scale = properties.scale,
        baseValue = min || this.baseValue;
    // check min/max
    value = value > max ? max : value < min ? min : value;
    // round to step
    value = baseValue + Math[round || "floor"]((value - baseValue) / scale) * scale;
    if (scale < 1) value = value.toFixed(String(properties.step).replace(/^.*\.|^\d+$/, "").length);
    return value;
  },

  getValueAsDate: function(element) {
    var number = this.getValueAsNumber(element, true);
    return isNaN(number) ? null : new Date(number);
  },

  setValueAsDate: function(element, date) {
    this.setValueAsNumber(element, date.valueOf(), true);
  },

  isValid: function(element) {
    var value = this.convertValueToNumber(element.value);
    return !isNaN(value) && value == this.getValidValue(element, value);
  },

  getProperties: function(element) {
    if (element == number._element) {
      var properties = number._properties;
    } else {
      number._element = element;
      properties = number._properties = {};
      properties.min = this.convertValueToNumber(this.get(element, "min")),
      properties.max = this.convertValueToNumber(this.get(element, "max")),
      properties.step = parseFloat(this.get(element, "step")) || 1,
      properties.scale = properties.step * this.stepScale;
    }
    return properties;
  },

  increment: function(element, amount, block) {
    var type = block ? "Block" : "Unit";
    amount *= this["get" + type + "Increment"](element);
    this.setValueAsNumber(element, this.getValueAsNumber(element) + amount);
  },

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * this.block;
  },

  getUnitIncrement: function(element) {
    return (this.get(element, "step") || 1) * this.stepScale;
  }
};

