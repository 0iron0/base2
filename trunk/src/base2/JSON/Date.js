
JSON.Date = JSON.Object.extend({
	toJSONString: function(date) {
		var pad = function(n) {
			return n < 10 ? "0" + n : n;
		};	
		return '"' + date.getFullYear() + "-" +
			pad(date.getMonth() + 1) + "-" +
			pad(date.getDate()) + "T" +
			pad(date.getHours()) + ":" +
			pad(date.getMinutes()) + ":" +
			pad(date.getSeconds()) + '"';
	}
});
