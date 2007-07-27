var jsonTests = {};
jsonTests.testToBoolean = function() {
  var f=base2.JSON.Boolean.toJSONString;
  assertEqual(f(true), "true");
  assertEqual(f(false), "false");
};
jsonTests.testToNumber = function() {
  var o=base2.JSON.Number;
  assertEqual(o.toJSONString(0), "0");
  assertEqual(o.toJSONString(12345), "12345");
  assertEqual(o.toJSONString(-12345), "-12345");
  assertEqual(o.toJSONString(1.2345), "1.2345");
  assertEqual(o.toJSONString(-1.2345), "-1.2345");
  //can't be sure which power of ten the js-engine chooses
  assertEqual(parseFloat(o.toJSONString(12.34567e89)), 12.34567e89);
  assertEqual(parseFloat(o.toJSONString(-12.34567e-89)), -12.34567e-89);
  assertEqual(o.toJSONString(1/0), "null");
  assertEqual(o.toJSONString(-1/0), "null");
  assertEqual(o.toJSONString(Number.NEGATIVE_INFINITY), "null");
  assertEqual(o.toJSONString(Number.POSITIVE_INFINITY), "null");
  assertEqual(o.toJSONString(Number.NaN), "null");
};
jsonTests.testToString = function() {
  function quote(s) { return '"'+s+'"'; } //we test agains double quotes
  var o=base2.JSON.String;
  assertEqual(o.toJSONString(""), quote(""), "empty string");
  assertEqual(o.toJSONString("test"), quote("test"));
  assertEqual(o.toJSONString("I said: 'quiet'!"), quote("I said: 'quiet'!"));
  assertEqual(o.toJSONString("I said: \"quiet\"!"), quote('I said: \\"quiet\\"!'));
  assertEqual(o.toJSONString("Line1\nLine2\nLine3"), quote("Line1\\nLine2\\nLine3"));
  assertEqual(o.toJSONString("Line1\rLine2\rLine3"), quote("Line1\\rLine2\\rLine3"));
  assertEqual(o.toJSONString("Line1\n\rLine2\r\nLine3"), quote("Line1\\n\\rLine2\\r\\nLine3"));
  assertEqual(o.toJSONString("Column1\tColumn2"), quote("Column1\\tColumn2"));
  assertEqual(o.toJSONString("Form1\fForm2"), quote("Form1\\fForm2"));
  assertEqual(o.toJSONString("Delete\b\b\b\b\b\bBackspace"), quote("Delete\\b\\b\\b\\b\\b\\bBackspace"));
  assertEqual(o.toJSONString("Del\x7F"), quote("Del\x7F"));
  assertEqual(o.toJSONString("\x00"), quote("\\u0000"));
  assertEqual(o.toJSONString("\x01"), quote("\\u0001"));
  assertEqual(o.toJSONString("\x02"), quote("\\u0002"));
  assertEqual(o.toJSONString("\x03"), quote("\\u0003"));
  assertEqual(o.toJSONString("\x04"), quote("\\u0004"));
  assertEqual(o.toJSONString("\x05"), quote("\\u0005"));
  assertEqual(o.toJSONString("\x06"), quote("\\u0006"));
  assertEqual(o.toJSONString("\x07"), quote("\\u0007"));
  assertEqual(o.toJSONString("\x08"), quote("\\b"));
  assertEqual(o.toJSONString("\x09"), quote("\\t"));
  assertEqual(o.toJSONString("\x0a"), quote("\\n"));
  //Hexadecimal unicode test depends on Number.toString(16) is in lowercase
  assertEqual(o.toJSONString("\x0b"), quote("\\u000b"));
  assertEqual(o.toJSONString("\x0c"), quote("\\f"));
  assertEqual(o.toJSONString("\x0d"), quote("\\r"));
  assertEqual(o.toJSONString("\x0e"), quote("\\u000e"));
  assertEqual(o.toJSONString("\x0f"), quote("\\u000f"));
  assertEqual(o.toJSONString("\x10"), quote("\\u0010"));
  assertEqual(o.toJSONString("\x11"), quote("\\u0011"));
  assertEqual(o.toJSONString("\x12"), quote("\\u0012"));
  assertEqual(o.toJSONString("\x13"), quote("\\u0013"));
  assertEqual(o.toJSONString("\x14"), quote("\\u0014"));
  assertEqual(o.toJSONString("\x15"), quote("\\u0015"));
  assertEqual(o.toJSONString("\x16"), quote("\\u0016"));
  assertEqual(o.toJSONString("\x17"), quote("\\u0017"));
  assertEqual(o.toJSONString("\x18"), quote("\\u0018"));
  assertEqual(o.toJSONString("\x19"), quote("\\u0019"));
  assertEqual(o.toJSONString("\x1a"), quote("\\u001a"));
  assertEqual(o.toJSONString("\x1b"), quote("\\u001b"));
  assertEqual(o.toJSONString("\x1c"), quote("\\u001c"));
  assertEqual(o.toJSONString("\x1d"), quote("\\u001d"));
  assertEqual(o.toJSONString("\x1e"), quote("\\u001e"));
  assertEqual(o.toJSONString("\x1f"), quote("\\u001f"));
};
jsonTests.testToDate = function() {
  function d() { return new Date(Date.UTC.apply(this, arguments)); }
  function quote(s) { return '"'+s+'"'; } //we test agains double quotes
  var o=base2.JSON.Date;
  assertEqual(o.toJSONString(d(1972,11-1,14)), quote("1972-11-14T00:00:00Z"), "Date: date");
  // d(0,0,0,15,16,17) results in "Mon Jan 01 1900 16:16:17 GMT+0100 (CET)",
  // so don't test that.
  assertEqual(o.toJSONString(d(2007,07-1,28,0,28,10)), quote("2007-07-28T00:28:10Z"), "Date: date+time");
};
jsonTests.testToArray = function() {
  var o=base2.JSON.Array;
  assertEqual(o.toJSONString([]), "[]");
  assertEqual(o.toJSONString([1,2,3,4]), "[1,2,3,4]");
  assertEqual(o.toJSONString(new Array(2)), "[]");
  assertEqual(o.toJSONString([void 0,1,undefined,2,void true]), "[1,2]");
  assertEqual(o.toJSONString(new Array(0,1,2,3)), "[0,1,2,3]");
};
jsonTests.testToObject = function() {
  var o=base2.JSON.Object;
  assertEqual(o.toJSONString({}), "{}");
  assertEqual(o.toJSONString({a:1}), '{"a":1}');
  assertEqual(o.toJSONString({'while':1,'wend':void 0}), '{"while":1}');
  assertEqual(o.toJSONString({'while':1,'wend':2,loop:3}), '{"while":1,"wend":2,"loop":3}');
  assertEqual(o.toJSONString({"§±!@#$%^&*()_+=-[]}{:\"|';,./?><~`™}":1}), "{\"§±!@#$%^&*()_+=-[]}{:\\\"|';,./?><~`™}\":1}");
};
jsonTests.testJsonToString = function() {
  function quote(s) { return '"'+s+'"'; } //we test agains double quotes
  var JSON=base2.JSON;
  //--| first the basics
  //Issue 49: instanceOf(null, Object) raises exception
  //assertEqual(JSON.toString(null), "null", "null");
  //assertEqual(JSON.toString(void 0), "null", "undefined");
  assertEqual(JSON.toString(true), "true", "boolean true");
  assertEqual(JSON.toString(false), "false", "boolean false");
  assertEqual(JSON.toString(1), "1", "number positive");
  assertEqual(JSON.toString(0.0), "0", "number zero.zero");
  assertEqual(JSON.toString(-1), "-1", "number negative");
  assertEqual(JSON.toString(NaN), "null", "number but really");
  assertEqual(JSON.toString(1/0), "null", "number infinity");
  assertEqual(JSON.toString(""), quote(""), "string: empty");
  assertEqual(JSON.toString("non empty"), quote("non empty"), "string: non empty");
  assertEqual(JSON.toString([]), "[]", "array: empty");
  assertEqual(JSON.toString([1,2,3]), "[1,2,3]", "array: 1,2,3");
  assertEqual(JSON.toString({}), "{}", "object: empty");
  assertEqual(JSON.toString({a:1,b:2,c:3}), '{"a":1,"b":2,"c":3}', "object: {a:1,b:2,c:3}");
  //--| now combined
  assertEqual(JSON.toString([/*null,*/true,1234,'abcd']), '[true,1234,"abcd"]', 
    "array: mixed values");
  assertEqual(JSON.toString({/*a:null,*/b:true,c:1234,d:'abcd'}), '{"b":true,"c":1234,"d":"abcd"}', 
    "object: mixed values");
  assertEqual(JSON.toString([[1,2,[3]],[3,[2],1]]), '[[1,2,[3]],[3,[2],1]]', 
    "array: nested arrays");
  assertEqual(JSON.toString([[[[[[true]]]]]]), '[[[[[[true]]]]]]', 
    "array: nested arrays, 6 deep (max Safari2/WebKit can handle at the moment)");
  assertEqual(JSON.toString({a:{b:{c:{d:{e:{f:true}}}}}}),
    '{"a":{"b":{"c":{"d":{"e":{"f":true}}}}}}', "object: nested object, 6 deep");
  /*
  //--| Test for circular references: JSON standard doesn't define this at the moment
  //--| (browsers will generate exception after a while (Safari:max stack size exceeded; 
  //--| Firefox: too much recursion; IE: out of stack space))
  var a=[1], b=[a];
  a.push(b);
  JSON.toString(b);
  */
};