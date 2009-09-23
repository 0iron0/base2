
_register("input", {
  "implements": [validation],
  
  type: "text",
  pattern: "",
  autofocus: false,
  required: false,

  get: function(element, propertyName) {
    switch (propertyName) {
      case "valueAsNumber":
        return _getChromeValue(element, _TYPE_NUMBER, NaN);
      case "valueAsDate":
        return _getChromeValue(element, _TYPE_DATE, null);
    }
    return this.base(element, propertyName);
  },
  
  stepDown: function(element, n) {
    this.stepUp(element, -n);
  },

  setUp: function(element, n) {
    var control = chrome.getBehavior(element);
    if (control && control.increment) {
      control.increment(element, n);
    }
  }
});
