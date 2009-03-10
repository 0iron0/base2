
var weekpicker = datepicker.extend({
  PATTERN: /^\d{4}-W([0-4]\d|5[0-3])$/,

  appearance: "weekpicker",
  stepScale: 604800000,
    
  onchange: function(element) {
    var value = element.value;
    this.removeClass(element, "jsb-error");
    if (!this.PATTERN.test(value)) {
      if (/^\d{4}-W[1-9]$/.test(value)) { // close enough
        element.value = value.slice(0, -1) + 0 + value.slice(-1);
      } else {
        this.addClass(element, "jsb-error");
      }
    }
  },

  convertValueToNumber: function(value) {
		if (!this.PATTERN.test(value)) return NaN;
		var parts = String(value).split("-W"),
        date = new Date(parts[0], 0, 1);
		while (date.getDay() != 1) date.setDate(date.getDate() + 1);
		date = new Date(date.valueOf() + (parts[1] - 1) * this.stepScale);
		return (date.getFullYear() == parts[0]) ? date.valueOf() : NaN;
  },

  convertNumberToValue: function(number) {
    var date = new Date(number),
        jan1 = new Date(date.getFullYear(), 0, 1),
        week = parseInt((date - jan1) / this.stepScale) + 1;
		return date.getFullYear() + "-W" + pad(week);
  },
  
  Popup: {
    onmouseup: function(event) {
      if (!Traversal.contains(this.days, event.target)) return;
      var target = this.currentItem;
      //if (target.nodeName == "TD" && Traversal.contains(this.days, target)) {
        var day = NodeSelector.querySelector(target.parentNode, "td:not(.disabled)"),
            year = this.year.value,
            jan1 = new Date(year, 0, 1),
            date = new Date(year, this.month.selectedIndex, day[_TEXT]),
            week = parseInt((date - jan1) / weekpicker.stepScale) + 1;
            
        this.owner.setValue(this.element, pad(year, 4) + "-W" + pad(week, 2));
        this.hide();
        this.reset(target);
        this.previousElement.focus();
      //}
    },

    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && Traversal.contains(this.days, target)) {
        this.highlight(target.parentNode);
      }
    },

    highlight: function(week) {
      if (week.nodeName == "TD") {
        week = week.parentNode;
      }
      this.base(week);
    },

    getDate: function() {
      var value = weekpicker.convertValueToNumber(this.element.value);
      return isNaN(value) ? new Date() : new Date(value);
    }
  }
});
