
var monthpicker = spinner.extend({
  appearance: "timepicker",
  step: 1,
  stepScale: 1,

  // events

  onchange: function(element) {
    if (this.getValueAsDate(element)) {
      this.removeClass(element, "jsb-error");
    } else {
      this.addClass(element, "jsb-error");
    }
  },

  // methods
  
  increment: function(element, amount, block) {
    var date = this.getValueAsDate(element);
    if (block) {
      date.setFullYear(date.getFullYear() + amount);
    } else {
      date.setMonth(date.getMonth() + amount);
    }
    this.setValueAsDate(element, date);
  },

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 12;
  },

  getValueAsDate: function(element) {
    var number = this.convertValueToNumber(element.value);
    return isNaN(number) ? null : new Date(number);
  },

  setValueAsDate: function(element, date) {
    this.setValueAsNumber(element, date.valueOf());
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse(value + "-12T");
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(0, 7);
  },
});
