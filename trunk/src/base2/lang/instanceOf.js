
function instanceOf(object, klass) {
	assertType(klass, "function", "Invalid 'instanceOf' operand.");
	
	// Ancient browsers throw an error when we use "instanceof" as an operator.
	/*@cc_on @*/
	/*@if (@_jscript_version < 5.1)
		if ($Legacy.instanceOf(object, klass)) return true;
	@else @*/
		if (object instanceof klass) return true;
	/*@end @*/
	
	// Handle exceptions where the target object originates from another frame
	// this is handy for JSON parsing (amongst other things).
	if (object != null) switch (klass) {
		case Array: // this is the only troublesome one
			return !!(object.join && object.splice && typeof object == "object");
		case RegExp:
			return typeof object.source == "string" && typeof object.ignoreCase == "boolean";
		case Function:
			return !!(typeof object == "function" && object.call);
		case Date:
			return !!object.getTimezoneOffset;
		case String:
		case Number:
		case Boolean:
			return typeof object == typeof klass.prototype.valueOf();
		case Object:
			return true;
	}
	return false;
};
