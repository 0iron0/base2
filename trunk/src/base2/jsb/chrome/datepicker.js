
var datepicker = dropdown.extend({
  // properties

  Popup: {
    appearance: "datepicker-popup",

    scrollX: false,
    scrollY: false,

    currentDate: new Date,
  
    render: function() {
      var MONTHS = "<option>" + locale.months.split(",").join("<option>");
      var HTML = '\
<div style="white-space:nowrap"><select style="vertical-align:top">' +
MONTHS + '\
</select>\
 <input class="jsb-spinner" value="2009" size="4">\
</div><div style="clear:both;"></div>\
<table cellspacing="0">\
<tr><th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>\
<tr><td></td><td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td></tr>\
<tr><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td></tr>\
<tr><td>13</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td></tr>\
<tr><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td></tr>\
<tr><td>27</td><td>28</td><td>29</td><td>30</td><td>31</td><td></td><td></td></tr>\
<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>\
</table>\
';
      function wrap(items, tagName) {

      };

      this.base(HTML);
      
      this.month = this.querySelector("select");
      this.year = this.querySelector("input");
      this.table = this.querySelector("table");
      
      spinner.attach(this.year);
      
      this.render = Undefined; // do once
    },

    onchange: function(event) {
      var date = Month(new Date(this.year.value, this.month.selectedIndex, 1));
      date.fill(this.table);
    },

    onclick: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && target.className != "disabled") {
        var month = this.month.selectedIndex,
            year = this.year.value,
            day = target[_TEXT];
        function pad(number, length) {
          return "0000".slice(0, length - number.length) + number;
        };
        this.element.value = pad(year, 4) + "-" + pad(++month + "", 2) + "-" + pad(day, 2);
        this.hide();
        this.reset(target);
      }
    },

    onmouseover: function(event) {
      var target = event.target;
      if (target.nodeName == "TD" && target.className != "disabled") {
        this.highlight(event.target);
      }
    },

    highlight: function(cell) {
      this.reset(this.querySelector("td.selected"));
      if (cell) behavior.addClass(cell, "selected");
    },

    reset: function(cell) {
      if (cell) behavior.removeClass(cell, "selected");
    },

    layout: function() {
      var currentDate = this.currentDate,
          date = Month(new Date(this.year.value = currentDate.getUTCFullYear(), this.month.selectedIndex = currentDate.getUTCMonth(), 1));
      date.fill(this.table);
    },

    show: function(element) {
      this.currentDate = new Date2(element.value + "T00:00:00Z");
      this.base(element);
      var bodyStyle = this.body.style,
          monthStyle = this.month.style,
          yearStyle = this.year.style;
      forEach.csv("fontFamily,fontSize,fontWeight,fontStyle", function(propertyName) {
        monthStyle[propertyName] =
        yearStyle[propertyName] = bodyStyle[propertyName];
      });
      yearStyle.height = this.month.offsetHeight + "px";
      spinner.layout(this.year);
      var cells = this.body.getElementsByTagName("td");
      this.highlight(cells[14 - cells[14][_TEXT] + this.currentDate.getUTCDate()]);
    },
    
    "@MSIE": {
      render: function() {
        this.base();
        this.month.attachEvent("onchange", bind("handleEvent", this));
      },
      
      style: function() {
        this.base();
        jsb.createStyleSheet("td,th{font-size:" + this.body.style.fontSize + "}", this.popup.document);
      }
    },

    onmouseup: function(event) {
      this.element.focus();
    }
  },
  
  hitTest: True
});
