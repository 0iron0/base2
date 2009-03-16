
var weekpicker = datepicker.extend({
  PATTERN: /^\d{4}-W([0-4]\d|5[0-3])$/,

  appearance: "weekpicker",
  stepScale: 604800000, // milliseconds in a week

  showToolTip: Undefined,

  convertValueToNumber: function(value) {
    if (!this.PATTERN.test(value)) return NaN;
    var parts = String(value).split("-W"),
        date = new Date(Date.UTC(parts[0], 0, 1));
    while (date.getUTCDay() != chrome.locale.firstDay) date.setUTCDate(date.getUTCDate() + 1);
    date = new Date(date.valueOf() + (parts[1] - 1) * this.stepScale);
    return (date.getUTCFullYear() == parts[0]) ? date.valueOf() : NaN;
  },

  convertNumberToValue: function(number) {
    var date = new Date(number),
        jan1 = new Date(Date.UTC(date.getFullYear(), 0, 1)),
        week = Math.floor((date - jan1) / this.stepScale) + 1;
    return pad(date.getUTCFullYear(), 4) + "-W" + pad(week);
  },
  
  Popup: {
    onkeydown: function(event) {
      if (!/^(37|39)$/.test(event.keyCode)) { // ignore datepicker behavior for left/right arrows
        this.base(event);
      }
    },
    
    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && Traversal.contains(this.days, target)) {
        this.highlight(target.parentNode);
        this.currentDate = parseInt(NodeSelector.querySelector(target.parentNode, "td:not(.disabled)")[_TEXT]);
      }
    },

    onmouseup: function(event) {
      if (Traversal.contains(this.days, event.target)) {
        this.select(this.currentItem);
      }
    },
    
    highlight: function(item) {
      if (item.nodeName == "TD") {
        item = item.parentNode;
      }
      this.base(item);
    }
  }
});
