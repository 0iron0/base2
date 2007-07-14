var pad2 = function(n) {
	return n < 10 ? "0" + n : n;
};	
var pad3 = function(n) {
	return n < 100 ? "0" + pad2(n) : pad2(n);
};
// http://developer.mozilla.org/es4/proposals/date_and_time.html#iso_date_strings
var Date2 = base2.Module.extend({
	toISO: function(date) {
	  //TODO: serialize in UTC? Discussion on mailinglist.
	  //TODO: year in at least 4 digits (edge case)
	  var datePart = date.getUTCFullYear() + "-" + pad2(date.getUTCMonth() + 1) + "-" + pad2(date.getUTCDate());
	  var time = [pad2(date.getUTCHours()), pad2(date.getUTCMinutes()), pad2(date.getUTCSeconds()), pad3(date.getUTCMilliseconds())];
	  while (time[time.length - 1] == 0) time.pop();
	  if (time.length > 0) {
	    return datePart + "T" + time.join(":").replace(/:(\d{3})$/, '.$1')+"Z";
	  } else {
	    return datePart;
	  }
	}
},{
	parse: function(string) {
	  //TODO: 
	  //  according to proposal, "T" is mandatory. This is weird...
	  //  date part is optional; implement
	  var match = this.ISO_FORMAT.exec(string);
	  //console.dir(match);
	  if (match) {
	    var date = new Date(0);
	    var S = Date2.SUBMATCH;
	    date.setUTCFullYear(match[S.FULLYEAR]);
	    date.setUTCMonth(match[S.MONTH] - 1);
	    date.setUTCDate(match[S.DATE]);
	    if (match[S.HOURS] !== undefined) {
        var timezone_sign = match[S.TIMEZONE_SIGN] || "";
        var timezone_hours = Number(timezone_sign + (match[S.TIMEZONE_HOURS] || "0"));
        var timezone_minutes = Number(timezone_sign + (match[S.TIMEZONE_MINUTES] || "0"));
        date.setUTCHours(Number(match[S.HOURS]) + timezone_hours);
  	    if (match[S.MINUTES] !== undefined) {
  	      date.setUTCMinutes(Number(match[S.MINUTES]) + timezone_minutes);
    	    if (match[S.SECONDS] !== undefined) {
    	      date.setUTCSeconds(match[S.SECONDS]);
      	    if (match[S.MILLISECONDS] !== undefined) {
      	      var ms = Number(match[S.MILLISECONDS]);
      	      var x = Number(match[S.SUBMILLISECONDS] || "0");
      	      if (x>=5) ms++;
      	      date.setUTCMilliseconds(ms);
      	    }
    	    }
	      }
	    }
	    return date.valueOf();
	  } else {
	    return Date.parse(string);
	  }	  
	},
  ISO_FORMAT: /^([0-9]{4})-([0-9]{2})-([0-9]{2})(?:T(\d{2})(?::(\d{2})(?::(\d{2})(?:\.(\d{3})(\d?)\d*)?)?)?(Z|(\+|-)(\d{2})(?::(\d{2}))?))?$/,
  SUBMATCH: {
    FULLYEAR: 1,
    MONTH: 2,
    DATE: 3,
    HOURS: 4,
    MINUTES: 5,
    SECONDS: 6,
    MILLISECONDS: 7,
    SUBMILLISECONDS: 8,
    TIMEZONE: 9,
    TIMEZONE_SIGN: 10,
    TIMEZONE_HOURS: 11,
    TIMEZONE_MINUTES: 12
  }
});
