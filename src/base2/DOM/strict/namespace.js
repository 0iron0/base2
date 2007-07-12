
// employ strict validation of DOM calls

eval(base2.namespace);
eval(DOM.namespace);

var base = function(object, args) {
	// invoke the base method with all supplied arguments
	return object.base.apply(object, args);
};
