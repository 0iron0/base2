
var timepicker = spinner.extend({
  // constants

  FORMAT: "hh:mm:ss",

  // properties

  appearance: "timepicker",
  block: 60,
  step: "60",
  stepScale: 1000,
  type: "time", // web forms 2.0 type

  /*"@(Date.prototype.toLocaleTimeString)": {
    onchange: function(element) {
      this.base(element);
      if (!this.hasClass(element, "jsb-error") && element.value) {
        this.showToolTip(element, new Date(Date2.parse("T" + element.value + "Z")).toLocaleTimeString());
      }
    }
  },*/

  // methods

  getDefaultValue: function() {
    var date = new Date;
    return Date.UTC(1970, 0, 1, date.getHours(), date.getMinutes(), 0, 0);
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse("1970-01-01T" + value + "Z");
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(11, 16);
    //var value = Date2.toISOString(new Date(number)).slice(11).replace(/\.\d{3}Z$/, "");
    //return value.replace(/:00$/, ""); // fix me: this should be dependant on an element's step attribute
  }
});
