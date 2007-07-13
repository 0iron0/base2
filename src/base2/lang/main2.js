
var $id = 1;
var assignID = function(object) {
	// assign a unique id
	if (!object.base2ID) object.base2ID = "b2_" + $id++;
	return object.base2ID;
};

var FORMAT = /%([1-9])/g;
var format = function(string) {
	// replace %n with arguments[n]
	// e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
	// ==> "she sells sea shells"
	// only %1 - %9 supported
	var args = arguments;
	return String(string).replace(FORMAT, function(match, index) {
		return index < args.length ? args[index] : match;
	});
};

var match = function(string, expression) {
	// same as String.match() except that this function will return an empty 
	// array if there is no match
	return String(string).match(expression) || [];
};

var RESCAPE = /([\/()[\]{}|*+-.,^$?\\])/g;
var rescape = function(string) {
	// make a string safe for creating a RegExp
	return String(string).replace(RESCAPE, "\\$1");
};

var SLICE = Array.prototype.slice;
var slice = function(object) {
	// slice an array-like object
	return SLICE.apply(object, SLICE.call(arguments, 1));
};

var LTRIM = /^\s\s*/;
var RTRIM = /\s\s*$/; // http://blog.stevenlevithan.com/archives/faster-trim-javascript
var trim = function(string) {
	return String(string).replace(LTRIM, "").replace(RTRIM, "");
};
