
var Binding = Interface.extend(null, {
	extend: function(_interface, _static) {
		// convoluted code here because some libraries add bind()
		//  to Function.prototype and base2 can't tell the difference
		var bind = this.bind;
		if (_static) {
			bind = _static.bind || bind;
			delete _static.bind;
		}
		var binding = this.base(_interface, _static);
		extend(binding, "bind", bind);
		return binding;
	}
});

Binding.bind = function(object) {
	return this(object); // cast
};
