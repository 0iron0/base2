
var control = behavior.extend({
	willValidate: false,
	validationMessage: "",

	checkValidity: function(control) {
		var valid = false;
		if (!valid) {
			this.dispatchEvent(control, "invalid");
		}
		return valid;
	},

	setCustomValidity: function(control, error) {
	}
});
