
_registerElement("time", {
  detect:  "dateTime",

  display: "inline",
  
  behavior: {
    dateTime: "",
    pubDate: false,
    
    onattach: function(element) {
      this.layout(element);
    },

    get: function(element, propertyName) {
      if (propertyName == "valueAsDate") {
        var dateTime = this.hasAttribute(element, "datetime") ?
          this.parseDateFromAttribute(element) :
          this.parseDateFromText(element);
        return isNaN(dateTime) ? null : new Date(dateTime);
      }
      return this.base(element, propertyName);
    },

    parseDateFromAttribute: function(element) {
      var dateTime = this.get(element, "dateTime");
      if (dateTime) {
        if (dateTime.indexOf("T") == -1) dateTime += "T";
        return Date2.parse(dateTime);
      }
      return NaN;
    },

    parseDateFromText: function(element) {
      var textContent = trim(this.get(element, "textContent")),
          dateTime = Date2.parse(textContent);
      if (!isNaN(dateTime)) return dateTime;
      dateTime = Date2.parse(textContent + "T");
      if (!isNaN(dateTime)) return dateTime;
      dateTime = Date2.parse("T" + textContent);
      return dateTime;
    },

    layout: function(element) {
      if (!this.get(element, "textContent")) {
        var dateTime = this.parseDateFromAttribute(element);
        if (!isNaN(dateTime)) {
          dateTime = new Date(dateTime);
          var showTime = this.get(element, "dateTime").indexOf("T") != -1;
          if (Date.prototype.toLocaleString) {
            var textContent = showTime ? dateTime.toLocaleString() : dateTime.toLocaleDateString();
          } else {
            textContent = showTime ? dateTime : dateTime.toDateString();
          }
          this.set(element, "textContent", textContent);
        }
      }
    }
  }
});
