
extend(HTMLElement.prototype, "extend", function(name, value) {
	// automatically attach event handlers when extending
	if (!Base._prototyping && Event.PATTERN.test(name) && typeof value == "function") {
		EventTarget.addEventListener(this, name.slice(2), value);
		return this;
	}
	if (arguments.length == 2 && name == "style") {
		extend(this.style, value);
		return this;
	}
	return base(this, arguments);
});
