
// all other libraries allow this handy shortcut so base2 will too :-)

DOM.$ = function(selector, context) {
	return new Selector(selector).exec(context || document, 1);
};

DOM.$$ = function(selector, context) {
	return new Selector(selector).exec(context || document);
};
