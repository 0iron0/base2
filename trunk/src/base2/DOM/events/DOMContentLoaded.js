
// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoaded = new Base({
	fired: false,
	
	fire: function() {
		if (!DOMContentLoaded.fired) {
			DOMContentLoaded.fired = true;
			// this function might be called from another event handler so we'll user a timer
			//  to drop out of any current event.
			// eval a string for ancient browsers
			setTimeout("base2.EventTarget.dispatchEvent(document,'DOMContentLoaded')", 0);
		}
	},
	
	init: function() {
		// use the real event for browsers that support it (opera & firefox)
		EventTarget.addEventListener(document, "DOMContentLoaded", function() {
			DOMContentLoaded.fired = true;
		});
		// if all else fails fall back on window.onload
		EventTarget.addEventListener(window, "load", DOMContentLoaded.fire);
	},

	"@(addEventListener)": {
		init: function() {
			this.base();
			addEventListener("load", DOMContentLoaded.fire, false);
		}
	},

	"@(attachEvent)": {
		init: function() {
			this.base();
			attachEvent("onload", DOMContentLoaded.fire);
		}
	},

	"@MSIE.+win": {
		init: function() {
			this.base();
			// Matthias Miller/Mark Wubben/Paul Sowden/Me
			document.write("<script id=__ready defer src=//:><\/script>");
			document.all.__ready.onreadystatechange = function() {
				if (this.readyState == "complete") {
					this.removeNode(); // tidy
					DOMContentLoaded.fire();
				}
			};
		}
	},
	
	"@KHTML": {
		init: function() {
			this.base();
			// John Resig
			var timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(timer);
					DOMContentLoaded.fire();
				}
			}, 100);
		}
	}
});

DOMContentLoaded.init();
