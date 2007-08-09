
extend(HTMLElement.prototype, "extend", function(name, value) {
  if (!base2.__prototyping && arguments.length >= 2) {
    // automatically attach event handlers when extending
    if (Event.PATTERN.test(name) && typeof value == "function") {
      EventTarget.addEventListener(this, name.slice(2), value, false);
      return this;
    }
    // extend the style object
    if (name == "style") {
      extend(this.style, value);
      return this;
    }
    if (name == "extend") return this;
  }
  return base(this, arguments);
});
