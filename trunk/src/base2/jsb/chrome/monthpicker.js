
var monthpicker = spinner.extend({
  // constants

  FORMAT: "yyyy-mm",
  
  // properties
  
  type: "month", // web forms 2.0 type
  block: 12,
  appearance: "monthpicker",

  /*onchange: function(element) {
    this.base(element);
    if (!this.hasClass(element, "jsb-error") && element.value) {
      var date = this.getValueAsDate(element, true);
      this.showToolTip(element, chrome.locale.months[date.getUTCMonth()] + " " + date.getUTCFullYear());
    }
  },*/

  // methods

  convertValueToNumber: function(value) {
    if (value == "" || isNaN(Date2.parse(value + "-01T"))) return NaN;
    value = value.split("-");
    return (value[0] * 12) + parseInt(value[1], 10) - 1;
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(~~(number / 12), number % 12, 12)).slice(0, 7);
  },

  getDefaultValue: function() {
    var date = new Date;
    return date.getFullYear() * 12 + date.getMonth();
  },

  getValueAsNumber: function(element, external) {
    return external ? Date2.parse(element.value + "-01T00:00Z") : this.base(element);
  },

  setValueAsNumber: function(element, value, external) {
    if (external) {
      value = this.convertValueToNumber(Date2.toISOString(new Date(value)).slice(0, 7));
    }
    this.base(element, value);
  }
});
