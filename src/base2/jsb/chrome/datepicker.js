
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
      this.base(
'<table style="margin:4px" cellspacing="0">\
<tr>\
<td><select>' +
wrap(chrome.locale.months, "option") +
'</select></td>\
<td align="right"><input type="text" class="jsb-spinner" size="4"></td>\
</tr>\
<tr>\
<td colspan="2">\
<table style="width:100%;margin-top:2px;padding:2px" class="jsb-datepicker-days" cellspacing="0" tabindex="1">' +
'<tr unselectable="on">' + wrap(chrome.locale.days, "th", 'unselectable="on"') + '</tr>' +
Array(7).join('<tr unselectable="on">' + Array(8).join('<td unselectable="on">0</td>') + '</tr>') +
'</table>\
</td>\
</tr>\
</table>'
);
      
      this.year = this.querySelector("input");
      this.month = this.querySelector("select");
      this.days = this.querySelector("table.jsb-datepicker-days");
      
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

    onblur: function(event) {
      console2.log("onblur: "+event.target.nodeName);
      if (/INPUT|SELECT/.test(event.target.nodeName)) {
        ClassList.remove(this.days, "jsb-days_inactive");
      }
    },

    onfocus: function(event) {
      console2.log("onfocus: "+event.target.nodeName);
      if (/INPUT|SELECT/.test(event.target.nodeName)) {
        ClassList.add(this.days, "jsb-days_inactive");
      } else {
        ClassList.remove(this.days, "jsb-days_inactive");
      }
    },

    onchange: function(event) {
      this.fill();
    },

    onmouseup: function(event) {
      if (!Traversal.contains(this.days, event.target)) return;
      var target = this.currentItem;
      //if (target.nodeName == "TD" && target.className != "disabled") {
        var value = pad(this.year.value, 4) + "-" + pad(this.month.selectedIndex + 1, 2) + "-" + pad(target[_TEXT], 2);
        this.owner.setValue(this.element, value);
        this.hide();
        this.reset(target);
        this.previousElement.focus();
      //}
    },
    
    "@MSIE|Webkit": {
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
      if (target.nodeName == "TD" && target.className != "disabled" && Traversal.contains(this.days, target)) {
        this.highlight(target);
      }
    },
    
    // methods
    
    hide: function() {
      this.base();
      ClassList.remove(this.days, "jsb-days_inactive");
    },

    tab: function() {
      var popup = this,
          days = popup.days;
      popup._active = true;
      switch (popup.querySelector(":focus")) {
        case null:
          popup.month.focus();
          ClassList.add(this.days, "jsb-days_inactive");
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
      //setTimeout(function() {
        //delete popup._active;
        //days.removeAttribute("tabindex");
      //}, 1);
      return false;
    },

    "@MSIE|Gecko|Webkit": {
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
          
      d.setDate(d.getUTCDate() - d.getUTCDay() + chrome.locale.firstDay);
      // we need to ensure that we do not start after the first of the month
      if (d > d2) {
        d.setDate(d.getUTCDate() - 7);
      }

      for (var i = 1; i < 7; i++) {
        var row = this.days.rows[i],
            cells = row.cells, cell,
            hasDays = false;
        for (var j = 0; cell = cells[j]; j++) {
          cell.innerHTML = d.getUTCDate();
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
          daysStyle = this.days.style,
          days = this.body.getElementsByTagName("td");
      forEach.csv("fontFamily,fontSize,fontWeight,fontStyle,color", function(propertyName) {
        daysStyle[propertyName] =
        monthStyle[propertyName] =
        yearStyle[propertyName] = bodyStyle[propertyName];
      });
      //daysStyle.backgroundColor =
      yearStyle.backgroundColor = bodyStyle.backgroundColor;
      //yearStyle.height = this.month.offsetHeight + "px";
      spinner.layout(this.year);
      this.highlight(days[14 - days[14][_TEXT] + this.currentDate.getUTCDate()]);
      //this.month.focus();
    },
    
    "@MSIE": {
      /*tab: function() {
        var popup = this,
            days = popup.days;
        popup._active = true;
        console2.log(popup.querySelector(":focus"));
        switch (popup.querySelector(":focus")) {
          case null:
            popup.year.select();
            return true;
          case popup.month:
            //popup.year.focus();
            popup.year.select();
            return true;
          case popup.year:
            days.focus();
            return true;
        }
      },*/
      
      render: function() {
        this.base();
        var popup = this;
        this.month.attachEvent("onchange", function(event) {
          popup.handleEvent(Event.bind(event));
        });
        //jsb.createStyleSheet("td,th{font-size:10px;color:black}", this.popup.document);
      },

      style: function() {
        this.base();
        var style= this.body.style;
        //forEach (this.popup.document.styleSheets[1].rules, function(rule) {
        //  rule.style.cssText = "font-size:" + style.fontSize + ";color:" + style.color;
        //}, this);
      }
    }
  }
});
