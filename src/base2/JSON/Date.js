
JSON.Date = JSON.Object.extend({
  toJSONString: function(date) {
    return '"' + Date2.toISOString(date) + '"';
  }
});
