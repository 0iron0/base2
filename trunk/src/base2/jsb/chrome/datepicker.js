
var datepicker = dropdown.extend({
  implements: [number],

  //PATTERN: /^\d{4}-(0\d|10|11|12)-\d{2}$/,

  appearance: "datepicker",
  stepScale: 86400000,
  
  // events

  onchange: function(element) {
    if (this.getValueAsDate(element)) {
      this.removeClass(element, "jsb-error");
    } else {
      this.addClass(element, "jsb-error");
    }
  },
  
  "@(Date.prototype.toLocaleDateString)": {
    onchange: function(element) {
      this.base(element);
      if (!this.hasClass(element, "jsb-error")) {
        this.showToolTip(element, this.getValueAsDate(element).toLocaleDateString());
      }
    }
  },
  
  // methods

  getValueAsDate: function(element) {
    var number = this.convertValueToNumber(element.value);
    return isNaN(number) ? null : new Date(number);
  },

  setValueAsDate: function(element, date) {
    this.setValueAsNumber(element, date.valueOf());
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse(value + "T00:00:00Z");
  },
  
  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(0, 10);
  },
  
  // properties
  
  Popup: {
    appearance: "datepicker-popup",

    scrollX: false,
    scrollY: false,

    currentDate: 0,
  
    render: function() {
      this.base(
'<div style="padding:4px"><table style="margin:0" cellspacing="0">\
<tr>\
<td><select>' +
wrap(chrome.locale.months, "option") +
'</select></td>\
<td align="right"><input type="text" class="jsb-spinner" size="4"></td>\
</tr>\
<tr>\
<td colspan="2">\
<table style="width:100%;margin:2px 0 0 0;padding:2px" class="jsb-datepicker-days" cellspacing="0" tabindex="1">\
<tr unselectable="on">' + wrap(chrome.locale.days, "th", 'unselectable="on"') + '</tr>' +
Array(7).join('<tr unselectable="on">' + Array(8).join('<td unselectable="on">0</td>') + '</tr>') +
'</table>\
</td>\
</tr>\
</table></div>'
);
      
      this.year = this.querySelector("input");
      this.month = this.querySelector("select");
      this.days = this.querySelector("table.jsb-datepicker-days");
      
      this.controls = new Array2(this.month, this.year, this.days);
      
      this.year.onscroll = _resetScroll;
      spinner.attach(this.year);
      
      this.setUnselectable(this.days);
      
      this.render = Undefined; // do once
      
      function wrap(items, tagName, attributes) {
        return reduce(items, function(html, text) {
          return html += "<" + tagName + " " + attributes + ">" + text + "</" + tagName + ">";
        }, "");
      };
    },

    onchange: function(event) {
      this.fill();
    },

    onkeydown: function(event) {
      var keyCode = event.keyCode,
          target = event.target;
      
      if (keyCode == 13) { // enter
        this.select(this.currentItem);
        event.preventDefault();
        return;
      }
          
      if (target != this.year && target != this.month && /^(3[3467809]|40)$/.test(keyCode)) {
        var startDate = this.getDate(),
            date = new Date(startDate);
            
        event.preventDefault();
        
        switch (keyCode) {
          case 36: // home
            date = this.owner.getValueAsDate(this.element) || new Date;
            break;
          case 37: // left
            date.setUTCDate(date.getUTCDate() - 1);
            break;
          case 39: // right
            date.setUTCDate(date.getUTCDate() + 1);
            break;
          case 38: // up
            date.setUTCDate(date.getUTCDate() - 7);
            break;
          case 40: // down
            date.setUTCDate(date.getUTCDate() + 7);
            break;
          case 34: // page up
            if (event.ctrlKey) { // increment by year if the ctrl key is down
              date.setUTCFullYear(date.getUTCFullYear() - 1);
            } else { // by month
              date.setUTCDate(date.getUTCDate() - 28);
              if (date.getUTCMonth() == startDate.getUTCMonth()) {
                date.setUTCDate(date.getUTCDate() - 7);
              }
            }
            break;
          case 33: // page down
            if (event.ctrlKey) {
              date.setUTCFullYear(date.getUTCFullYear() + 1);
            } else {
              date.setUTCDate(date.getUTCDate() + 28);
              if (date.getUTCMonth() == startDate.getUTCMonth()) {
                date.setUTCDate(date.getUTCDate() + 7);
              }
            }
            break;
        }
        this.currentDate = date.getUTCDate();
        if (date.getUTCMonth() == startDate.getUTCMonth() && date.getUTCFullYear() == startDate.getUTCFullYear()) {
          this.highlightByDate();
        } else {
          this.year.value = date.getUTCFullYear();
          this.month.selectedIndex = date.getUTCMonth();
          this.fill();
        }
      } else {
        this.base(event);
      }
    },

    onmouseup: function(event) {
      var day = event.target;
      if (!Traversal.contains(this.days, day)) return;
      if (day.className == "disabled") return;
      this.select(this.currentItem);
    },

    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && target.className != "disabled" && Traversal.contains(this.days, target)) {
        this.highlight(target);
        this.currentDate = parseInt(target[_TEXT]);
      }
    },

    // methods

    getDate: function() {
      return new Date(Date.UTC(this.year.value, this.month.selectedIndex, this.currentDate, 12));
    },

    fill: function() {
      var month = this.month.selectedIndex,
          d = new Date(this.year.value, month, 1, 12),
          d2 = new Date(d);
          
      d.setUTCDate(d.getUTCDate() - d.getDay() + chrome.locale.firstDay);
      // we need to ensure that we do not start after the first of the month
      if (d > d2) {
        d.setUTCDate(d.getUTCDate() - 7);
      }

      var rows = this.days.rows, row,
          currentCell, lastCell;
      for (var i = 1; row = rows[i]; i++) {
        var cells = row.cells, cell,
            hasDays = false;
        for (var j = 0; cell = cells[j]; j++) {
          var date = d.getUTCDate(),
              isSameMonth = month == d.getUTCMonth();
          cell.innerHTML = date;
          cell.className = isSameMonth ? "" : "disabled";
          if (isSameMonth) {
            lastCell = cell;
            if (this.currentDate == date) currentCell = cell;
          }
          hasDays |= isSameMonth;
          d.setUTCDate(date + 1);
        }
        row.style.visibility = hasDays ? "" : "hidden";
      }
      this.highlight(currentCell || lastCell);
    },

    highlight: function(item) {
      if (item) {
        this.reset(this.currentItem);
        this.currentItem = item;
        ClassList.add(item, "selected");
      }
    },

    highlightByDate: function() {
      var rows = this.days.rows, row;
      for (var i = 1; row = rows[i]; i++) {
        var cells = row.cells, cell;
        for (var j = 0; cell = cells[j]; j++) {
          if (cell[_TEXT] == this.currentDate && cell.className != "disabled") {
            this.highlight(cell);
            return;
          }
        }
      }
    },

    layout: function() {
      var date = this.owner.getValueAsDate(this.element) || new Date;
      this.year.value = date.getUTCFullYear();
      this.month.selectedIndex = date.getUTCMonth();
      this.currentDate = date.getUTCDate();
      this.fill();
      spinner.layout(this.year);
    },

    reset: function(item) {
      if (item) ClassList.remove(item, "selected");
    },

    select: function() {
      var element = this.element;
      this.owner.setValueAsDate(element, this.getDate());
      this.hide();
      element.focus();
    },

    style: function(element) {
      this.base(element);
      var bodyStyle = this.body.style,
          monthStyle = this.month.style,
          yearStyle = this.year.style,
          daysStyle = this.days.style,
          days = this.body.getElementsByTagName("td");
      forEach.csv("fontFamily,fontSize,fontWeight,fontStyle,color", function(propertyName) {
        daysStyle[propertyName] =
        monthStyle[propertyName] =
        yearStyle[propertyName] = bodyStyle[propertyName];
      });
      daysStyle.backgroundColor =
      yearStyle.backgroundColor = bodyStyle.backgroundColor;
      this.highlight(days[14 - days[14][_TEXT] + this.currentDate]);
    }
  }
});
