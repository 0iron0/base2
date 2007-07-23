var date2tests = {};
date2tests.testToISOString = function() {
  var date = Date2(new Date(0));
  date.setUTCFullYear(1972, 11-1, 14);
  assertEqual(date.toISOString(), "1972-11-14T", "yyyy-MM-dd format");
  date.setUTCHours(5);
  assertEqual(date.toISOString(), "1972-11-14T05Z", "yyyy-MM-ddThhZ format");
  date.setUTCMinutes(12);
  assertEqual(date.toISOString(), "1972-11-14T05:12Z", "yyyy-MM-ddThh:mmZ format");
  date.setUTCSeconds(59);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59Z", "yyyy-MM-ddThh:mm:ssZ format");
  date.setUTCMilliseconds(1);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.001Z", "yyyy-MM-ddThh:mm:ss:milZ format");
  date.setUTCMilliseconds(12);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.012Z", "yyyy-MM-ddThh:mm:ss:milZ format");
  date.setUTCMilliseconds(999);
  assertEqual(date.toISOString(), "1972-11-14T05:12:59.999Z", "yyyy-MM-ddThh:mm:ss:milZ format");
};
date2tests.testParseLocal = function() {
  var d = new Date(Date2.parse("1972-11-14T"));
  console.info(d.getDate()+" "+d.toString());
  assertEqual(d.getFullYear(), 1972, "yyyy-MM-dd format; year");
  assertEqual(d.getMonth(), 11-1, "yyyy-MM-dd format; month");
  assertEqual(d.getDate(), 14, "yyyy-MM-dd format; date");
  //TODO: also time
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
  try {
    Date2.parse("Aug 9, 1995", new Date());
    assert(false, "SyntaxError (too many arguments) expected");
  }
  catch(ex) {
    assertType(ex, SyntaxError, "Aug 9, 1995 testing with defaultDate: "+ex.message);
  }
};
date2tests.testParseDefaultDate = function() {
  var defaultDate = new Date(1972, 11-1, 14, 1, 2, 3, 4);
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
date2tests.testParseSyntaxError = function() {
  try {
    Date2.parse("T60:70:80.900");
    assert(false, "SyntaxError exception expected (T60:70:80.900 overflow testing)");
  }
  catch(ex) {
    assertType(ex, SyntaxError, "T60:70:80.900 overflow testing");
  }
};
