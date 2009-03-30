
var timepicker = spinner.extend({
  appearance: "timepicker",
  step: 60,
  stepScale: 1000,

  // events

  onchange: _date_onchange,

  /*"@(Date.prototype.toLocaleTimeString)": {
    onchange: function(element) {
      this.base(element);
      if (!this.hasClass(element, "jsb-error")) {
        this.showToolTip(element, this.getValueAsDate(element).toLocaleTimeString());
      }
    }
  },*/

  // methods

  getBlockIncrement: function(element) {
    return this.getUnitIncrement(element) * 60;
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse("T" + value) + 500;
  },

  convertNumberToValue: function(number) {
    if (isNaN(number)) return "";
    var value = Date2.toISOString(new Date(number)).slice(11).replace(/\.\d{3}Z$/, "");
    return value.replace(/:00$/, ""); // fix me: this should be dependant on an element's step attribute
  }
});
