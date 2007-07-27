
JSON.Date = JSON.Object.extend({
	toJSONString: function(date) {
		var pad = function(n) {
			return n < 10 ? "0" + n : n;
		};	
		return '"' + date.getUTCFullYear() + "-" +
			pad(date.getUTCMonth() + 1) + "-" +
			pad(date.getUTCDate()) + "T" +
			pad(date.getUTCHours()) + ":" +
			pad(date.getUTCMinutes()) + ":" +
			pad(date.getUTCSeconds()) + 'Z"';
	}
});
