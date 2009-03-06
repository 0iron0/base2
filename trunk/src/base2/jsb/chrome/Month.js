
var Month = Abstract.extend({
  fill: function(table) {
    var d = new Date(this.getUTCFullYear(), this.getUTCMonth(), 1, 12);
    var d2 = new Date(d);
    d.setDate(d.getUTCDate() - d.getUTCDay() + Month.firstDay);
    // we need to ensure that we do not start after the first of the month
    if (d > d2) {
      d.setDate(d.getUTCDate() - 7);
    }

    for (var i = 1; i < 7; i++) {
      var cells = table.rows[i].cells, cell;
      for (var j = 0; cell = cells[j]; j++) {
        cell[_TEXT] = d.getUTCDate();
        cell.className = this.isSameMonth(d) ? "" : "disabled";
        d.setUTCDate(d.getUTCDate() + 1);
      }
    }
  },

  getLastDay: function() {
    var lastDay = new Date(this);
    var month = this.getUTCMonth();
    var date = 31;
    while (date) {
      lastDay.setUTCDate(date--);
      if (lastDay.getUTCMonth() == month) break;
    }
    return lastDay;
  },

  isSameMonth: function(date) {
    return this.isSameYear(date) && this.getUTCMonth() == date.getUTCMonth();
  },

  isSameYear: function(date) {
    return !!date && this.getUTCFullYear() == date.getUTCFullYear();
  }
}, {
  firstDay: 1 // Sunday = 0, Monday = 1, etc
});