
var datepicker = dropdown.extend({
  implements: [number],

	//PATTERN: /^\d{4}-(0\d|10|11|12)-\d{2}$/,

  appearance: "datepicker",
  stepScale: 86400000,
  
  // events

  onchange: function(element) {
    if (isNaN(Date2.parse(element.value + "T"))) {
      this.addClass(element, "jsb-error");
    } else {
      this.removeClass(element, "jsb-error");
    }
  },

  convertValueToNumber: function(value) {
    return value == "" ? NaN : Date2.parse(value + "T00:00:00Z");
  },
  
  convertNumberToValue: function(number) {
    return Date2.toISOString(new Date(number)).replace(/T.*$/, "");
  },
  
  // properties
  
  Popup: {
    appearance: "datepicker-popup",

    scrollX: false,
    scrollY: false,

    currentDate: new Date,
  
    render: function() {
      var days = locale.days.split(",");
      for (var i = 0; i < locale.firstDay; i++) days.push(days.shift());
      this.base(
'<div style="white-space:nowrap">\
<select>' +
wrap(locale.months.split(","), "option") +
'</select>\
 <input class="jsb-spinner" size="4">\
</div>\
<div style="clear:both;"></div>\
<table cellspacing="0" tabindex="1">' +
'<tr unselectable="on">' + wrap(days, "th") + '</tr>' +
Array(7).join('<tr unselectable="on">' + Array(8).join('<td unselectable="on">0</td>') + '</tr>') +
'</table>'
);
      
      this.year = this.querySelector("input");
      this.month = this.querySelector("select");
      this.days = this.querySelector("table");
      
      this.year.onscroll = _resetScroll;
      spinner.attach(this.year);
      
      this.days.setAttribute("unselectable", "on");
      
      this.render = Undefined; // do once
      
      function wrap(items, tagName) {
        return reduce(items, function(html, text) {
          return html += "<" + tagName + ">" + text + "</" + tagName + ">";
        }, "");
      };
    },

    onchange: function(event) {
      this.fill();
    },

    onclick: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && target.className != "disabled") {
        var value = pad(this.year.value, 4) + "-" + pad(this.month.selectedIndex + 1, 2) + "-" + pad(target[_TEXT], 2);
        this.owner.setValue(this.element, value);
        this.hide();
        this.reset(target);
        this.previousElement.focus();
      }
    },
    
    "@Webkit": {
      onkeydown: function(event) {
        if (event.keyCode == 9) { // tab
          if (this.tab()) event.preventDefault();
        }
      }
    },

    onkeypress: function(event) {
      if (event.keyCode == 9) { // tab
        if (this.tab()) event.preventDefault();
      }
    },

    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && target.className != "disabled") {
        this.highlight(target);
      }
    },
    
    // methods

    tab: function() {
      var popup = this,
          days = popup.days;
      popup._active = true;
      switch (popup.querySelector(":focus")) {
        case null:
          popup.month.focus();
          return true;
        //case popup.month:
        //  popup.year.select();
        //  popup.year.focus();
        //  return true;
        //case popup.year:
          //days.tabIndex = "-1";
          //days.focus();
          //return true;
        case popup.days:
          delete popup._active;
          popup.element.focus();
      }
      setTimeout(function() {
        //delete popup._active;
        //days.removeAttribute("tabindex");
      }, 1);
      return false;
    },

    "@Gecko|Webkit": {
      tab: function() {
        var popup = this,
            days = popup.days;
        popup._active = true;
        switch (popup.querySelector(":focus")) {
          case popup.month:
            //popup.year.focus();
            popup.year.select();
            return true;
          case popup.year:
            days.focus();
            return true;
        }
        return this.base();
      }
    },

    onfocus: Undefined,

    "@Opera": {
      onfocus: function(event) {
        if (event.target == this.days) {
          getSelection().collapse(this.days, 0); // prevent text selection
        }
      }
    },

    getDate: function() {
      return new Date(Date2.parse(this.element.value + "T00:00:00Z") || Date2.now());
    },

    fill: function() {
      var month = new Date(this.year.value, this.month.selectedIndex, 1, 12),
          d = new Date(month),
          d2 = new Date(d);
          
      d.setDate(d.getUTCDate() - d.getUTCDay() + locale.firstDay);
      // we need to ensure that we do not start after the first of the month
      if (d > d2) {
        d.setDate(d.getUTCDate() - 7);
      }

      for (var i = 1; i < 7; i++) {
        var row = this.days.rows[i],
            cells = row.cells, cell,
            hasDays = false;
        for (var j = 0; cell = cells[j]; j++) {
          cell[_TEXT] = d.getUTCDate();
          var isSameMonth = this.isSameMonth(month, d);
          hasDays |= isSameMonth;
          cell.className = isSameMonth ? "" : "disabled";
          d.setUTCDate(d.getUTCDate() + 1);
        }
        row.style.visibility = hasDays ? "" : "hidden";
      }
    },

    highlight: function(day) {
      if (day) {
        this.reset(this.currentItem);
        this.currentItem = day;
        ClassList.add(day, "selected");
      }
    },

    isSameMonth: function(date1, date2) {
      return this.isSameYear(date1, date2) && date1.getUTCMonth() == date2.getUTCMonth();
    },

    isSameYear: function(date1, date2) {
      return date1 && date2 && date1.getUTCFullYear() == date2.getUTCFullYear();
    },

    layout: function() {
      this.currentDate = this.getDate();
      this.year.value = this.currentDate.getUTCFullYear();
      this.month.selectedIndex = this.currentDate.getUTCMonth();
      this.fill();
    },

    reset: function(day) {
      if (day) ClassList.remove(day, "selected");
    },

    show: function(element) {
      this.base(element);
      var bodyStyle = this.body.style,
          monthStyle = this.month.style,
          yearStyle = this.year.style,
          days = this.body.getElementsByTagName("td");
      forEach.csv("fontFamily,fontSize,fontWeight,fontStyle", function(propertyName) {
        monthStyle[propertyName] =
        yearStyle[propertyName] = bodyStyle[propertyName];
      });
      yearStyle.height = this.month.offsetHeight + "px";
      spinner.layout(this.year);
      this.highlight(days[14 - days[14][_TEXT] + this.currentDate.getUTCDate()]);
      //this.month.focus();
    },
    
    "@MSIE": {
      render: function() {
        this.base();
        var popup = this;
        this.month.attachEvent("onchange", function(event) {
          popup.handleEvent(Event.bind(event));
        });
        jsb.createStyleSheet("td,th{font-size:10px}", this.popup.document);
      },

      style: function() {
        this.base();
        forEach (this.popup.document.styleSheets[1].rules, function(rule) {
          rule.style.cssText = "font-size:" + this.body.style.fontSize;
        }, this);
      }
    }
  }
});
