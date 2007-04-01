
var Window = Module.extend(null, {
	verify: function(window) {
		return (window && window.Infinity) ? window : null;
	},
	
	"@MSIE": {
		verify: function(window) {
			// A very weird bug...
			return (window == self) ? self : this.base();
		}
	}
});
