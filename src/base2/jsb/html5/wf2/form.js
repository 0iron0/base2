
var form = html5.element.extend({
	dispatchFormChange: function(form) {
		this.dispatchEvent(form, "formchange");
	},

	dispatchFormInput: function() {
		this.dispatchEvent(form, "forminput");
	}
});
