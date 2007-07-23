
// http://developer.mozilla.org/es4/proposals/date_and_time.html

//-dean: TEST!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//-dean: TODO: Timezone offset not currently supported.

var _ERROR_INVALID      = "'%1' is not a valid ISO date.";
var _ERROR_OUT_OF_RANGE = " %2 out of range.";

// big, ugly, regular expression
var _PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d+))?)?)?)?(([+-])\d{2}(:\d{2})?|Z)?$/;	
var _PARTS = { // indexes to the sub-expressions of the RegExp above
	FullYear: 2,
	Month: 4,
	Date: 6,
	Hours: 8,
	Minutes: 10,
	Seconds: 12,
	Milliseconds: 14
};

var Date2 = _createObject2(
	Date, "", [{
		toISOString: function(date) {
			date = Date(date);
			var string = "####-##-##T##:##:##.###";
			for (var part in _PARTS) {
				string = string.replace(/#+/, function(digits) {
					var value = date["get" + part]();
					if (part == "Month") value++; // js month starts at zero
					return ("000" + value).slice(-digits.length); // pad
				});
			}
			return string.replace(/([^.])0+$/, "$1"); // remove trailing zeroes
		}
	}]
);

Date2.now = function() {
	return (new Date).valueOf(); // milliseconds since the epoch
};

Date2.parse = function(string, defaultDate) {
	// parse ISO date
	var match = String(string).match(_PATTERN);
	assert(match, format(_ERROR_INVALID, string), SyntaxError);
	match[_PARTS.Month]--; // js months start at zero
	var last = ""; // the last date part set
	var date = new Date2(defaultDate || 0);
	for (var part in _PARTS) {
		var value = match[_PARTS[part]];
		if (!value) break; // no more values
		// set a date part
		date["set" + part](value);
		// make sure that the last setting did not break a previous setting
		//  e.g. setting a month of "13" will affect the year 
		assert(!last || date["get" + last]() == match[_PARTS[last]], // untested
			format(_ERROR_INVALID + _ERROR_OUT_OF_RANGE, string, part), SyntaxError);
		last = part;
	}
/*	// stolen from Paul Sowden
	var offset = 0;
	if (d[14]) {
        offset = d[16] * 60 + d[17];
        offset *= ((d[15] == "-") ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();   
	var time = Number(date) + offset * 60 * 1000;
	date.setTime(time); */
	return date;
};
