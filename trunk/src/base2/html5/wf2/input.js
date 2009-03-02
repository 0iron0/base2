
var input = html5.input = control.extend({
	validity: null,
	autofocus: false,
	list: null,
	pattern: "",
	willValidate: true,
	
	//"@MSIE[56]": {
  	onattach: function(input) {
      switch (Element.getAttribute(input, "type")) {
        case "color":
          this.addClass(input, "jsb-colorpicker");
          break;
        case "number":
          this.addClass(input, "jsb-spinner");
          break;
        case "range":
          this.addClass(input, "jsb-slider");
          break;
      }
  	},
  //},

	dispatchChange: function(input) {
		this.dispatchEvent(input, "change");
	},

	dispatchFormChange: function(input) {
		this.dispatchEvent(input, "formchange");
	}
});
