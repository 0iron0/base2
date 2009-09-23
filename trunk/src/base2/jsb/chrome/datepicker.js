var datepicker = dropdown.extend({
  "implements": [number],

  // constants
  
  FORMAT: "yyyy-mm-dd",

  // properties
  
  type: "date", // web forms 2.0 type
  appearance: "datepicker",
  stepScale: _DAY,
  
  // events

  showLocaleString: Undefined,
  
  "@(Date.prototype.toLocaleDateString)": {
    onchange: function(element) {
      this.base(element);
      if (!this.hasClass(element, "jsb-error") && element.value) {
        this.showLocaleString(element);
      }
    },

    "@!Opera|Linux": { // Opera's local date strings aren't very helpful
      showLocaleString: function(element) {
        this.showToolTip(element, new Date(Date2.parse(element.value + "T")).toLocaleDateString());
      }
    }
  },
  
  // methods

  getDefaultValue: Date2.now,

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse(value + "T00:00Z");
  },

  convertNumberToValue: function(number) {
    return isNaN(number) ? "" : Date2.toISOString(new Date(number)).slice(0, 10);
  },

  normalise: I,
  
  // properties
  
  Popup: {
    appearance: "datepicker-popup",

    scrollX: false,
    scrollY: false,

    currentDate: 0,
    state: {},
  
    render: function() {
      this.base(
format('<div style="padding:4px!important"><table cellspacing="0">\
<tr>\
<td><select>' +
wrap(chrome.locale.months, "option") +
'</select></td>\
<td align="right"><input type="text" class="jsb-spinner" size="4"></td>\
</tr>\
<tr>\
<td colspan="2">\
<table role="grid" class="jsb-datepicker-days" cellspacing="0">\
<tr>' + wrap(chrome.locale.days, "th", '%1') + '</tr>' +
Array(7).join('<tr>' + Array(8).join('<td %1>0</td>') + '</tr>') +
'</table>\
</td>\
</tr>\
</table></div>', 'role="gridcell" unselectable="on"')
);
      
      this.year = this.querySelector("input");
      this.month = this.querySelector("select");
      this.days = this.querySelector("table.jsb-datepicker-days");
      
      this.year.onscroll = _resetScroll;
      spinner.attach(this.year);

      this.month.selectedIndex = 8; // september is the longest month (in terms of text)
      
      this.setUnselectable(this.days);
      
      this.render = Undefined; // do once
    },

    onblur: function(event) {
      ClassList.add(this.days, "jsb-datepicker-days_focus");
    },

    onchange: function(event) {
      if (this.currentMonth != this.month.selectedIndex) {
        this.increment("Month", this.month.selectedIndex - this.currentMonth);
      } else {
        this.increment("FullYear", this.year.value - this.currentYear);
      }
      event.stopPropagation();
    },

    onfocus: function(event) {
      if (event.target != this.days) {
        ClassList.remove(this.days, "jsb-datepicker-days_focus");
      }
    },

    onkeydown: function(event) {
      var keyCode = event.keyCode,
          target = event.target,
          step = parseFloat(this.owner.get(this.element, "step")) || 1;
          
      if (keyCode == 13) { // enter
        this.select(this.currentItem);
        event.preventDefault();
      } else if (/^(3[346789]|40)$/.test(keyCode)) { // navigation keys (arrows etc)
        if (target == this.month) {
          setTimeout(bind(function() {
            if (this.currentMonth != this.month.selectedIndex) {
              this.increment("Month", this.currentMonth - this.month.selectedIndex);
            }
          }, this), 1);
        } else if (target != this.year) {
          event.preventDefault();
          switch (keyCode) {
            case 36: // home
              this.highlighByDate(this.owner.getValueAsDate(this.element) || this.getDefaultDate());
              break;
            case 37: // left
              this.increment("Date", -step);
              break;
            case 39: // right
              this.increment("Date", step);
              break;
            case 38: // up
              this.increment("Date", -step * 7);
              break;
            case 40: // down
              this.increment("Date", step * 7);
              break;
            case 33: // page up
              if (event.ctrlKey) { // increment by year if the ctrl key is down
                this.increment("FullYear", -1);
              } else { // by month
                this.increment("Month", -1);
              }
              break;
            case 34: // page down
              if (event.ctrlKey) {
                this.increment("FullYear", 1);
              } else {
                this.increment("Month", 1);
              }
              break;
          }
        }
      } else {
        this.base(event);
      }
    },

    onmouseup: function(event) {
      var day = event.target;
      if (day.className == "disabled" || !Traversal.contains(this.days, day)) return;
      this.select(this.currentItem);
    },

    onmouseover: function(event) {
      var target = event.target;
      if (target.currentItem != target && target.nodeName == "TD" && target.className != "disabled" && Traversal.contains(this.days, target)) {
        this.highlight(target);
        this.currentDate = ~~target[_TEXT_CONTENT];
      }
    },

    onmousemove: function(event) {
      this.onmouseover(event);
    },

    onmousewheel: function(event) {
      event.preventDefault();
      this.increment("Month", ~~(event.wheelDelta / 120));
    },

    // methods

    fill: function() {
      this.currentYear = this.year.value;
      this.currentMonth = this.month.selectedIndex;
      var month = this.currentMonth,
          d = new Date(Date.UTC(this.currentYear, month, 1)),
          d2 = new Date(d),
          owner = this.owner,
          properties = owner.getProperties(this.element),
          baseValue = properties.min || owner.baseValue,
          step = properties.step,
          scale = properties.scale,
          min = properties.min,
          max = properties.max,
          minMonth = 0,
          maxMonth = 11,
          option;
          
      if (isNaN(min)) {
        min = -Infinity;
      } else {
        var minDate = new Date(min);
        if (this.currentYear == minDate.getUTCFullYear()) {
          minMonth = minDate.getUTCMonth();
        }
      }

      if (isNaN(max)) {
        max = Infinity;
      } else {
        var maxDate = new Date(max);
        if (this.currentYear == maxDate.getUTCFullYear()) {
          maxMonth = maxDate.getUTCMonth();
        }
      }
      
      for (var i = 0; option = this.month.options[i]; i++) {
        var disabled = i < minMonth || i > maxMonth;
        option.disabled = disabled;
        option.style.color = disabled ? "graytext" : "";
      }
          
      d.setUTCDate(d.getUTCDate() - d.getUTCDay() + chrome.locale.firstDay);
      // ensure that we do not start after the first of the month
      if (d > d2) {
        d.setUTCDate(d.getUTCDate() - 7);
      }

      var rows = this.days.rows, row,
          currentCell, lastCell;
      for (var i = 1; row = rows[i]; i++) {
        var cells = row.cells, cell, hasDays = false;
        row.className = "";
        if (owner == weekpicker && ((step != 1 && (d - baseValue) % scale != 0) || d < min || d > max)) {
          row.className = "disabled";
        }
        for (var j = 0; cell = cells[j]; j++) {
          var date = d.getUTCDate(),
              isSameMonth = month == d.getUTCMonth();
          cell.innerHTML = date;
          cell.className = "";
          cell.style.fontStyle = isSameMonth ? "" : "italic";
          if (isSameMonth && d >= min && d <= max) {
            lastCell = cell;
            if (this.currentDate == date) currentCell = cell;
            if (owner == datepicker && step != 1 && (d - baseValue) % scale != 0) {
              cell.className = "disabled";
            }
          } else {
            cell.className = "disabled";
          }
          hasDays |= isSameMonth;
          d.setUTCDate(date + 1);
        }
        row.style.visibility = hasDays ? "" : "hidden";
      }
      this.highlight(currentCell || lastCell);
    },

    getDefaultDate: function() {
      var state = this.state[this.element.uniqueID];
      return new Date(this.owner.getValidValue(this.element, this.owner.getValueAsDate(this.element) || (state ? new Date(state) : new Date()), "round"));
    },

    getUTCDate: function() {
      return new Date(Date.UTC(this.year.value, this.month.selectedIndex, this.currentDate));
    },

    hide: function() {
      if (this.element) {
        this.state[this.element.uniqueID] = this.getUTCDate();
      }
      this.base();
    },

    highlight: function(item) {
      if (item) {
        this.reset(this.currentItem);
        this.currentItem = item;
        ClassList.add(item, "selected");
        Element.setAttribute(item, "aria-selected", true);
        //item.tabIndex = -1;
        //if (this.isOpen()) item.focus();
      }
    },

    highlighByDate: function(date) {
      date = this.owner.normalise(date);
      this.year.value = date.getUTCFullYear();
      this.month.selectedIndex = date.getUTCMonth();
      this.currentDate = date.getUTCDate();
      if (this.currentYear == this.year.value && this.currentMonth == this.month.selectedIndex) {
        var days = this.body.getElementsByTagName("td");
        this.highlight(days[14 - days[14].innerHTML + this.currentDate]);
      } else {
        this.fill();
      }
    },

    increment: function(type, amount) {
      var date = new Date(Date.UTC(this.currentYear, this.currentMonth, this.currentDate));
      date["setUTC" + type](date["getUTC" + type]() + amount);
      date = new Date(this.owner.getValidValue(this.element, date, "round"));
      this.highlighByDate(date);
      //this.element.value = this.owner.convertNumberToValue(date.valueOf());
    },

    layout: function() {
      var date = this.owner.normalise(this.getDefaultDate());
      this.year.value = date.getUTCFullYear();
      this.month.selectedIndex = date.getUTCMonth();
      this.currentDate = date.getUTCDate();
      this.fill();
      spinner.layout(this.year);
    },

    movesize: function() {
      this.base();
      this.days.style.width = (parseInt(this.body.style.width) - 10) + "px";
    },

    reset: function(item) {
      if (item) {
        //item.tabIndex = 0;
        Element.removeAttribute(item, "aria-selected");
        ClassList.remove(item, "selected");
      }
    },

    select: function() {
      var element = this.element;
      this.owner.setValueAsDate(element, this.getUTCDate());
      this.hide();
      element.focus();
    },

    show: function(element) {
      this.base(element);
      //if (this.currentItem) this.currentItem.focus();
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
      this.highlight(days[14 - days[14].innerHTML + this.currentDate]);
      ClassList.add(this.days, "jsb-datepicker-days_focus");
    }
  }
});
