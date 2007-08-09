
JSON.Number = JSON.Object.extend({
  toJSONString: function(number) {
    return isFinite(number) ? String(number) : "null";
  }
});
