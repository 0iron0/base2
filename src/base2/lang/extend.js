
var base = function(object, args) {
	// invoke the base method with all supplied arguments
	return object.base.apply(object, args);
};

var extend = function(object) {
	assert(object != Object.prototype, "Object.prototype is verboten!");
	return Base.prototype.extend.apply(object, slice(arguments, 1));
};
