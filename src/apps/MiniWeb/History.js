
// Manage back/forward buttons

var History = Base.extend({
	constructor: function(callback) {
		this.visited = {};
	//-	var scrollTop = this.scrollTop = {};
		
		var hash;
		this.timer = setInterval(function() {
			if (hash != location.hash) {
				hash = location.hash;
				callback();
			//-	document.documentElement.scrollTop = scrollTop[hash];
			}
		}, 20);
		
	/*	// preserve scroll position
		window.onscroll = function() {
			if (hash == location.hash) {
				scrollTop[hash] = document.documentElement.scrollTop;
			}
		}; */
		
		this.add(location.hash || "#/");
	},
	
	timer: 0,
	visited: null,
	
	add: function(hash) {
		if (location.hash != hash) {
			location.hash = hash;
		}
	//-	this.scrollTop[hash] = 0;
		this.visited[hash] = true;
	},
	
	"@MSIE": {
		add: function(hash) {
			History.$write(hash);
			this.base(hash);
		}
	}
}, {		
	init: function() {
		// the hash portion of the location needs to be set for history to work properly
		// -- we need to do it before the page has loaded
		if (!location.hash) location.replace("#/");
	},
	
	"@MSIE": {
		$write: function(hash) {
			if (hash != location.hash) {
				var document = frames[0].document;
				document.open(); // -dean: get rid?
				document.write("<script>parent.location.hash='" + hash + "'<\/script>");
				document.close(); // -DRE
			}
		},
		
		init: function() {
			this.base();
			document.write("<iframe style=display:none></iframe>");
			this.$write(location.hash.slice(1)); // make sure it's unique the first time
		}
	}
});
