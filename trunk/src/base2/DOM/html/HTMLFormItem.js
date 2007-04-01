
var HTMLFormItem = HTMLElement.extend(null, {
	tags: "BUTTON,INPUT,SELECT,TEXTAREA",
	
	isSuccessful: function(element) {
		if (!element.name || element.disabled) return false;
		switch (element.type) {
			case "button":
			case "reset":
				return false;
			case "radio":
			case "checkbox":
				return element.checked;
			case "image":
			case "submit":
				return element == document.activeElement;
			default:
				return true;
		}
	},
	
	serialize: function(element) {
		return element.name + "=" + encodeURIComponent(element.value);
	}
});
