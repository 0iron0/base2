
var HTMLFormElement = HTMLElement.extend({
	serialize: function(form) {
		return filter(form.elements, HTMLFormItem.isSuccessful).map(HTMLFormItem.serialize).join("&");
	}
}, {
	tags: "FORM"
});
