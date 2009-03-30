var date2tests = {};
date2tests.testToISOString = function() {
  var date = Date2(new Date(0));
  date.setUTCFullYear(1972, 11-1, 14);
  assertEqual(date.toISOString(), "1972-11-14T00:00:00.000Z", "yyyy-MM-dd format");
  date.setUTCHours(5);
  assertEqual(date.toISOString(), "1972-11-14T05:00:00.000Z", "yyyy-MM-ddThhZ format");
  date.setUTCMinutes(12);
  assertEqual(date.toISOString(), "1972-11-14T05:12:00.000Z", "yyyy-MM-ddThh:mmZ format");
  date.setUTCSeconds(59);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.000Z", "yyyy-MM-ddThh:mm:ssZ format");
  date.setUTCMilliseconds(1);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.001Z", "yyyy-MM-ddThh:mm:ss:milZ format");
  date.setUTCMilliseconds(12);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.012Z", "yyyy-MM-ddThh:mm:ss:milZ format");
  date.setUTCMilliseconds(999);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.999Z", "yyyy-MM-ddThh:mm:ss:milZ format");
};
date2tests.testParseDefaultDate = function() {
  try {
    Date2.parse("1972-11-14T", new Date());
    assert(false, "TypeError (defaultDate should be number) expected");
  }
  catch(ex) {
    assertType(ex, TypeError, "Aug 9, 1995 testing with defaultDate: "+(ex.message||ex.description));
  }
  try {
    Date2.parse("Aug 9, 1995", new Date().valueOf());
    assert(false, "SyntaxError (too many arguments) expected");
  }
  catch(ex) {
    assertType(ex, SyntaxError, "Aug 9, 1995 testing with defaultDate: "+(ex.message||ex.description));
  }

};
date2tests.testParseLocal = function() {
  var d = new Date(Date2.parse("1972-11-14T"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-dd format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-dd format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-dd format; date");
  d = new Date(Date2.parse("1972-11-14T05"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh format; date");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh format; hours");
  d = new Date(Date2.parse("1972-11-14T05:12"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh:mm format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh:mm format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh:mm format; date");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh:mm format; hours");
  assertEqual(d.getMinutes(), 12, "yyyy-MM-ddThh:mm format; minutes");
  d = new Date(Date2.parse("1972-11-14T05:12:59"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh:mm:ss format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh:mm:ss format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh:mm:ss format; date");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh:mm:ss format; hours");
  assertEqual(d.getMinutes(), 12, "yyyy-MM-ddThh:mm:ss format; minutes");
  assertEqual(d.getSeconds(), 59, "yyyy-MM-ddThh:mm:ss format; seconds");
  d = new Date(Date2.parse("1972-11-14T05:12:59.012"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh:mm:ss:mil format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh:mm:ss:mil format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh:mm:ss:mil format; date");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh:mm:ss:mil format; hours");
  assertEqual(d.getMinutes(), 12, "yyyy-MM-ddThh:mm:ss:mil format; minutes");
  assertEqual(d.getSeconds(), 59, "yyyy-MM-ddThh:mm:ss:mil format; seconds");
  assertEqual(d.getMilliseconds(), 12, "yyyy-MM-ddThh:mm:ss:mil format; milliseconds");
  d = new Date(Date2.parse("1972-11-14T05:12:59.0123"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh:mm:ss:mil format; year (no overflow)");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh:mm:ss:mil format; month (no overflow)");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh:mm:ss:mil format; date (no overflow)");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh:mm:ss:mil format; hours (no overflow)");
  assertEqual(d.getMinutes(), 12, "yyyy-MM-ddThh:mm:ss:mil format; minutes (no overflow)");
  assertEqual(d.getSeconds(), 59, "yyyy-MM-ddThh:mm:ss:mil format; seconds (no overflow)");
  assertEqual(d.getMilliseconds(), 12, "yyyy-MM-ddThh:mm:ss:mil format; milliseconds (no overflow)");
  d = new Date(Date2.parse("1972-11-14T05:12:59.0127"));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddThh:mm:ss:mil format; year (overflow)");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddThh:mm:ss:mil format; month (overflow)");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddThh:mm:ss:mil format; date (overflow)");
  assertEqual(d.getHours(), 5, "yyyy-MM-ddThh:mm:ss:mil format; hours (overflow)");
  assertEqual(d.getMinutes(), 12, "yyyy-MM-ddThh:mm:ss:mil format; minutes (overflow)");
  assertEqual(d.getSeconds(), 59, "yyyy-MM-ddThh:mm:ss:mil format; seconds (overflow)");
  assertEqual(d.getMilliseconds(), 13, "yyyy-MM-ddThh:mm:ss:mil format; milliseconds (overflow)");
};
date2tests.testParseUtc = function() {
  d = new Date(Date2.parse("1972-11-14T05Z"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThhZ format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThhZ format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThhZ format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThhZ format; hour");
  d = new Date(Date2.parse("1972-11-14T05:12Z"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mmZ format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mmZ format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mmZ format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThh:mmZ format; hour");
  assertEqual(d.getUTCMinutes(), 12, "yyyy-MM-ddThh:mmZ format; minutes");
  d = new Date(Date2.parse("1972-11-14T05:12:59Z"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mm:ssZ format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mm:ssZ format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mm:ssZ format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThh:mm:ssZ format; hour");
  assertEqual(d.getUTCMinutes(), 12, "yyyy-MM-ddThh:mm:ssZ format; minutes");
  assertEqual(d.getUTCSeconds(), 59, "yyyy-MM-ddThh:mm:ssZ format; seconds");
  d = new Date(Date2.parse("1972-11-14T05:12:59.012Z"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mm:ss.milZ format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mm:ss.milZ format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mm:ss.milZ format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThh:mm:ss.milZ format; hour");
  assertEqual(d.getUTCMinutes(), 12, "yyyy-MM-ddThh:mm:ss.milZ format; minutes");
  assertEqual(d.getUTCSeconds(), 59, "yyyy-MM-ddThh:mm:ss.milZ format; seconds");
  assertEqual(d.getUTCMilliseconds(), 12, "yyyy-MM-ddThh:mm:ss.milZ format; milliseconds");
  d = new Date(Date2.parse("1972-11-14T05:12:59.01299Z")); //4-digit partial seconds
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mm:ss.milZ format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mm:ss.milZ format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mm:ss.milZ format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThh:mm:ss.milZ format; hour");
  assertEqual(d.getUTCMinutes(), 12, "yyyy-MM-ddThh:mm:ss.milZ format; minutes");
  assertEqual(d.getUTCSeconds(), 59, "yyyy-MM-ddThh:mm:ss.milZ format; seconds");
  assertEqual(d.getUTCMilliseconds(), 13, "yyyy-MM-ddThh:mm:ss.milZ format; milliseconds");
};
date2tests.testParseTimezone = function() {
  d = new Date(Date2.parse("1972-11-14T05:12:59.012+00:00"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; date");
  assertEqual(d.getUTCHours(), 5, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; hour");
  assertEqual(d.getUTCMinutes(), 12, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; minutes");
  assertEqual(d.getUTCSeconds(), 59, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; seconds");
  assertEqual(d.getUTCMilliseconds(), 12, "yyyy-MM-ddThh:mm:ss.mil+00:00 format; milliseconds");
  d = new Date(Date2.parse("1972-11-14T05:12:59.012-01:30"));
  assertEqual(d.getUTCFullYear(), 1972, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; year");
  assertEqual(d.getUTCMonth(), 11-1, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; month");
  assertEqual(d.getUTCDate(), 14, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; date");
  assertEqual(d.getUTCHours(), 3, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; hour");
  assertEqual(d.getUTCMinutes(), 42, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; minutes");
  assertEqual(d.getUTCSeconds(), 59, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; seconds");
  assertEqual(d.getUTCMilliseconds(), 12, "yyyy-MM-ddThh:mm:ss.mil-01:30 format; milliseconds");
};
date2tests.testParseNative = function() { // Test delegate parsing to Date.parse
  var d = new Date(Date2.parse("Aug 9, 1995"));
  assertEqual(d.getFullYear(), 1995, "Mmm dd, yyyy format; year");
  assertEqual(d.getMonth(), 8-1, "Mmm dd, yyyydd format; month");
  assertEqual(d.getDate(), 9, "Mmm dd, yyyy format; date");
};
date2tests.testParseDefaultDate = function() {
  var defaultDate = new Date(1972, 11-1, 14, 1, 2, 3, 4).valueOf();
  var d = new Date(Date2.parse("T", defaultDate));
  assertEqual(d.getFullYear(), 1972, "T format with default date; year");
  assertEqual(d.getMonth(), 11-1, "T format with default date; month");
  assertEqual(d.getDate(), 14, "T format with default date; date");
  assertEqual(d.getHours(), 1, "T format with default date; hour");
  assertEqual(d.getMinutes(), 2, "T format with default date; minutes");
  assertEqual(d.getSeconds(), 3, "T format with default date; seconds");
  assertEqual(d.getMilliseconds(), 4, "T format with default date; milliseconds");
  var d = new Date(Date2.parse("2007-07-23T", defaultDate));
  assertEqual(d.getFullYear(), 2007, "yyyy-MM-ddT format with default date; year");
  assertEqual(d.getMonth(), 07-1, "yyyy-MM-ddT format with default date; month");
  assertEqual(d.getDate(), 23, "yyyy-MM-ddT format with default date; date");
  assertEqual(d.getHours(), 1, "yyyy-MM-ddT format with default date; hour");
  assertEqual(d.getMinutes(), 2, "yyyy-MM-ddT format with default date; minutes");
  assertEqual(d.getSeconds(), 3, "yyyy-MM-ddT format with default date; seconds");
  assertEqual(d.getMilliseconds(), 4, "yyyy-MM-ddT format with default date; milliseconds");
  var d = new Date(Date2.parse("T16:06:08.012", defaultDate));
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-ddT format with default date; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-ddT format with default date; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-ddT format with default date; date");
  assertEqual(d.getHours(), 16, "yyyy-MM-ddT format with default date; hour");
  assertEqual(d.getMinutes(), 6, "yyyy-MM-ddT format with default date; minutes");
  assertEqual(d.getSeconds(), 8, "yyyy-MM-ddT format with default date; seconds");
  assertEqual(d.getMilliseconds(), 12, "yyyy-MM-ddT format with default date; milliseconds");
};
date2tests.testParseOverflow = function() {
  assert(isNaN(Date2.parse("T60:70:80.900")), "T60:70:80.900 overflow testing");
};
