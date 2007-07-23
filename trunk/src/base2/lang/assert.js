
function assert(condition, message, Err) {
	if (!condition) {
		throw new (Err || Error)(message || "Assertion failed.");
	}
};

function assertArity(args, arity, message) {
	if (arity == null) arity = args.callee.length;
	if (args.length < arity) {
		throw new SyntaxError(message || "Not enough arguments.");
	}
};

function assertType(object, type, message) {
	if (type && (typeof type == "function" ? !instanceOf(object, type) : typeof object != type)) {
		throw new TypeError(message || "Invalid type.");
	}
};
