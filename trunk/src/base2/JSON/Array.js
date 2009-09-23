
JSON.Array = JSON.Object.extend({
  toJSONString: function(array) {
    var i = array.length, strings = [];
    while (i--) strings[i] = JSON.Object.isValid(array[i]) ? JSON.toString(array[i]) : "null";
    return "[" + strings.join(",") + "]";
  }
});
