
var timepicker = spinner.extend({
  appearance: "timepicker",
  step: 60,
  stepScale: 1000,

  // events

  onchange: function(element) {
    if (this.getValueAsDate(element)) {
      this.removeClass(element, "jsb-error");
    } else {
      this.addClass(element, "jsb-error");
    }
  },

  // methods

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 60;
  },

  getValueAsDate: function(element) {
    var number = this.convertValueToNumber(element.value);
    return isNaN(number) ? null : new Date(number);
  },

  setValueAsDate: function(element, date) {
    this.setValueAsNumber(element, date.valueOf());
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse("1970-01-01T" + value);
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(11).replace(/:\d\d\.\d{3}Z$/, "");
  }
});
