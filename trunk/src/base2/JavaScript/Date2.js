
// http://developer.mozilla.org/es4/proposals/date_and_time.html

var _ERROR_INVALID      = "'%1' is not a valid ISO date.";
var _ERROR_OUT_OF_RANGE = " %2 out of range.";

// big, ugly, regular expression
var _PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;	
var _PARTS = { // indexes to the sub-expressions of the RegExp above
	FullYear: 2,
	Month: 4,
	Date: 6,
	Hours: 8,
	Minutes: 10,
	Seconds: 12,
	Milliseconds: 14
};
var _OTHER_PARTS = { // idem, but without the getter/setter usage on Date object
	Hectomicroseconds: 15, // :-P
  TzUtc: 16,
  TzSign: 17,
  TzHours: 18,
  TzMinutes: 20
};

var Date2 = _createObject2(
	Date, "", [{
		toISOString: function(date) {
			var string = "####-##-##T##:##:##.###";
			for (var part in _PARTS) {
				string = string.replace(/#+/, function(digits) {
					var value = date["getUTC" + part]();
					if (part == "Month") value++; // js month starts at zero
					return ("000" + value).slice(-digits.length); // pad
				});
			}
			// remove trailing zeroes, and remove UTC timezone, when time's absent
			return string.replace(/(((00)?:0+)?:0+)?\.0+$/, "").replace(/(T[0-9:.]+)$/, "$1Z"); 
		}
	}]
);

Date2.now = function() {
	return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
	// parse ISO date
	var match = String(string).match(_PATTERN);
	if (match) {
  	if (match[_PARTS.Month]) match[_PARTS.Month]--; // js months start at zero
  	// round milliseconds on 3 digits
  	if (match[_OTHER_PARTS.Hectomicroseconds] >= 5) match[_PARTS.Milliseconds]++;
  	var date = new Date(defaultDate ? defaultDate.valueOf() : 0);
  	var propertyInfix = match[_OTHER_PARTS.TzUtc] || match[_OTHER_PARTS.Hours] ? "UTC" : "";
  	for (var part in _PARTS) {
  		var value = match[_PARTS[part]];
  		if (!value) continue; // empty value
  		// set a date part
  		date["set" + propertyInfix + part](value);
  		// make sure that this setting does not overflow
  		assert(date["get" + propertyInfix + part]() == match[_PARTS[part]],
			  format(_ERROR_INVALID + _ERROR_OUT_OF_RANGE, string, part), SyntaxError);
  	}
  	//timezone can be set, without time being available
  	//also, without timezone, local timezone is respected
  	if (match[_OTHER_PARTS.TzHours]) {
  	  var tzHours = Number(match[_OTHER_PARTS.TzSign] + match[_OTHER_PARTS.TzHours]);
  	  var tzMinutes = Number(match[_OTHER_PARTS.TzSign] + (match[_OTHER_PARTS.TzMinutes] || 0));
  	  date.setUTCMinutes(date.getUTCMinutes() + tzHours * 60 + tzMinutes);
  	} 
    return date.valueOf();
  } else {
    assert(arguments.length == 1, "Too many arguments (parsing a non-ISO date doesn't support a defaultDate)", SyntaxError);
    return Date.parse(string);
  }
};
