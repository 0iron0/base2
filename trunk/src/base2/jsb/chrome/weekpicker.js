
var weekpicker = datepicker.extend({
  // constants
  
  FORMAT: "yyyy-Www",
  PATTERN: /^\d{4}-W([0-4]\d|5[0-3])$/,
  
  // properties

  baseValue: Date.UTC(1969, 11, 29),
  type: "week", // web forms 2.0 type
  appearance: "weekpicker",
  stepScale: 7 * _DAY,
  
  onfocus: function(element, event) {
    this.base(element, event);
    element.setAttribute("spellcheck", "false");
  },

  showLocaleString: Undefined,

  convertValueToNumber: function(value) {
    if (!this.PATTERN.test(value)) return NaN;
    var parts = String(value).split("-W"),
        year = parts[0],
        week1 = this.getFirstWeek(year),
        week = parts[1],
        date = new Date(week1.valueOf() + (week - 1) * this.stepScale);
    return (week == 53 && new Date(Date.UTC(year, 0, 1)).getUTCDay() != chrome.locale.firstDay + 3) ? NaN : date.valueOf();
  },

  convertNumberToValue: function(number) {
    var date = this.normalise(number),
        year = date.getUTCFullYear(),
        week1 = this.getFirstWeek(year),
        week = ~~((date - week1) / this.stepScale) + 1;
    return pad(year, 4) + "-W" + pad(week);
  },
  
  getFirstWeek: function(year) {
    var date = new Date(Date.UTC(year, 0, 1)),
  	    day = date.getUTCDay() - chrome.locale.firstDay;
    if (day > 3) day -= 7;
    date.setUTCDate(date.getUTCDate() - day);
    return date;
  },

  normalise: function(value) {
    return new Date(this.baseValue + ~~((value - this.baseValue) / this.stepScale) * this.stepScale + 3 * _DAY);
  },

  Popup: {
    onkeydown: function(event) {
      if (!/^(37|39)$/.test(event.keyCode)) { // ignore datepicker behavior for left/right arrows
        this.base(event);
      }
    },
    
    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD") {
        target = target.parentNode;
      }
      if (target.nodeName == "TR" && Traversal.contains(this.days, target) && !ClassList.has(target, "disabled")) {
        var cell = NodeSelector.querySelector(target, "td:not(.disabled)");
        if (cell) {
          this.highlight(target);
          this.currentDate = ~~cell[_TEXT_CONTENT];
        }
      }
    },

    onmouseup: function(event) {
      var target = event.target;
      if (target.nodeName == "TD") {
        target = target.parentNode;
      }
      if (target.nodeName == "TR" && Traversal.contains(this.days, target) && !ClassList.has(target, "disabled")) {
        this.select();
      }
    },
    
    highlight: function(item) {
      if (item && item.nodeName == "TD") {
        item = item.parentNode;
      }
      if (!ClassList.has(item, "disabled")) {
        this.base(item);
      }
    }
  }
});
