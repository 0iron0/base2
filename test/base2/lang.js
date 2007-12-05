var langTests = {};
langTests.testInstanceOfNative = function() {
  var instanceOf=base2.instanceOf;
  assertEqual(instanceOf(null, Object), false, "null");
  assertEqual(instanceOf(void 0, Object), false, "undefined");
  assertEqual(instanceOf("string", String), true, "string");
  assertEqual(instanceOf(123, Number), true, "number");
  assertEqual(instanceOf(true, Boolean), true, "boolean");
  assertEqual(instanceOf(new Date, Date), true, "date");
  assertEqual(instanceOf(new Date, Object), true, "date/object");
  assertEqual(instanceOf([], Object), true, "array/object");
  assertEqual(instanceOf([], Array), true, "array");
  assertEqual(instanceOf([], Date), false, "array/date");
};
langTests.testInstanceOfBase2 = function() {
  eval(base2.namespace);
  assertEqual(instanceOf(new Base, Object), true, "Base/Object");
  assertEqual(instanceOf(new Object, Base), false, "Object/Base");
  assertEqual(instanceOf(new Collection, Object), true, "Collection/Object");
  assertEqual(instanceOf(new Collection, Base), true, "Collection/Base");
  assertEqual(instanceOf(new Collection, Map), true, "Collection/Map");
};