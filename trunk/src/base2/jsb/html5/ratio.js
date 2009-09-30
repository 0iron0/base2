
// An interface shared by meter/progress.
// Parses max/value from textContent if no attributes are specified.

var ratio = behavior.extend({
  // Default DOM property values.
  max:   0,
  value: 0,

  onmouseover: function(element) {
    if (!element.title) {
      this._untitledElement = element;
      element.title = this.get(element, "textContent");
    }
  },

  onmouseout: function(element) {
    if (element == this._untitledElement) {
      delete this._untitledElement;
      element.title = "";
    }
  },

  onpropertyset: function(element, event, propertyName) {
    if (typeof this[propertyName] == "number" || propertyName == "innerHTML" || propertyName == "textContent") {
      this.layout(element);
    }
  },

  getRatio: function(element) {
    var max = this.getAttribute(element, "max"),
        value = this.getAttribute(element, "value");
    if (value == null) {
      var parsed = this.parseTextContent(element);
      if (max == null) {
        if (typeof parsed == "number") {
          value = parsed;
          max = 1;
        } else if (typeof parsed == "object") {
          value = parsed[_VALUE];
          max = parsed[_MAX];
        } else {
          value  = 0;
        }
      } else if (typeof parsed == "number") {
        value = parsed;
      } else {
        value = 0;
      }
    }
    if (isNaN(max) || max == null || max == "") {
      max = 1;
    }
    return [value - 0 || 0, max - 0];
  },

  parseTextContent: function(element) {
    var parsed = match(this.get(element, "textContent"), _PARSE_RATIO);
    if (parsed[1]) {
      var max = Math.max(parsed[0], parsed[1]),
          value = Math.min(parsed[0], parsed[1]);
    } else if (_PERCENT.test(parsed = parsed[0])) {
      max = parsed.indexOf("\u2031") > 0 ? 10000 : parsed.indexOf("\u2030") > 0 ? 1000 : 100,
      value = Number(parsed.slice(0, -1));
    } else {
      return isNaN(parsed) ? "" : Number(parsed);
    }
    if (!isNaN(max) && !isNaN(value)) {
      return [value, max];
    }
    return "";
  }
});
