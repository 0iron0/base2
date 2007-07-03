
var Binding = Interface.extend(null, {
	bind: function(object) {
		return this(object); // cast
	}
});
