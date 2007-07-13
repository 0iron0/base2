
// browser specific code

var element = document.createElement("span");
var jscript/*@cc_on=@_jscript_version@*/; // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164

var BOM = new base2.Namespace(this, {
	name:    "BOM",
	version: "0.9",
	exports: "detect",
	
	userAgent: "",

	init: function() {
		var MSIE/*@cc_on=true@*/;
		// initialise the user agent string
		var userAgent = navigator.userAgent;
		// fix opera's (and others) user agent string
		if (!MSIE) userAgent = userAgent.replace(/MSIE\s[\d.]+/, "");
		// close up the space between name and version number
		//  e.g. MSIE 6 -> MSIE6
		userAgent = userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
		this.userAgent = navigator.platform + " " + userAgent;
	},

	detect: function(test) {
		var r = false;
		var not = test.charAt(0) == "!";
		test = test
			.replace(/^\!?(if\s*|platform\s+)?/, "")
			.replace(/^(["']?)([^\(].*)(\1)$/, "/($2)/i.test(BOM.userAgent)");
		try {
			eval("r=!!" + test);
		} catch (error) {
			// the test failed
		}
		return Boolean(not ^ r);
	}
});

eval(this.imports);
