
html5.form = behavior.extend({
	dispatchFormChange: function(form) {
		this.dispatchEvent(form, "formchange");
	},

	dispatchFormInput: function() {
		this.dispatchEvent(form, "forminput");
	}
});
