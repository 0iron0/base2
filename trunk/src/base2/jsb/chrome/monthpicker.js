
var monthpicker = spinner.extend({
  appearance: "monthpicker",
  step: 1,
  stepScale: 1,

  // events

  onchange: _date_onchange,

  // methods

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 12;
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse(value + "-12T");
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(0, 7);
  },

  increment: function(element, amount, block) {
    var date = this.getValueAsDate(element) || new Date;
    if (block) {
      date.setFullYear(date.getFullYear() + amount);
    } else {
      date.setMonth(date.getMonth() + amount);
    }
    this.setValueAsDate(element, date);
  }
});
