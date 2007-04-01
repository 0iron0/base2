
extend(Event, {
	PATTERN: /^on(DOMContentLoaded|[a-z]+)$/,
	
	cancel: function(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
});
