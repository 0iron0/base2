
function Undefined() {
	return undefined;
};

function K(k) {
	return k;
};

function bind(fn, context) {
	var args = slice(arguments, 2);
	function _bind() {
		return fn.apply(context, args.concat(slice(arguments)));
	};
	_bind._cloneID = assignID(fn);
	return _bind;
};

function delegate(fn, context) {
	function _delegate() {
		return fn.apply(context, [this].concat(slice(arguments)));
	};
	return _delegate;
};

function partial(fn) {
	var args = slice(arguments, 1);
	function _partial() {
		return fn.apply(this, args.concat(slice(arguments)));
	};
	return _partial;
};

function unbind(fn) {
	function _unbind(context) {
		return fn.apply(context, slice(arguments, 1));
	};
	return _unbind;
};
