
// This object gets between the server and the file system to manage the
//  returned content.

// The interpreter provides access to the request object and its post data.
// It also has access to a copy of the client's request object.

var Interpreter = Command.extend({
	constructor: function(request) {
		this.base();
		this.request = copy(request);
		//this.config = MiniWeb.data.system.config;
	},
	
//	config: null,
	query: "",
	request: null,
	
/*	interpret: function() {
		var template = Interpreter.VIEW;
		var target = this.request.url;
		var status = this.request.status;
		
		if (status > 299) { // return an error page
			target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
		} else { // find a template
			if (target.indexOf("!") != -1) {
				target = target.split("!");
				this.query = target[1];
				target = target[0];
			}
			if (target == Interpreter.CREATE || target == Interpreter.EDIT || target == template) { // yuk!
				template = target;
				target = this.query;
			} else {
				// find a template
				var path = target.split("/");
				do {
					path.pop();
					template = path.join("/") + Interpreter.VIEW;
				} while (path.length && !this.exists(template));
				if (this.isDirectory(target) && this.exists(target + Interpreter.DEFAULT)) {
					target += Interpreter.DEFAULT;
				}
			}
		}
		return this.exec(template, target);
	}, */
	
	interpret: function() {
		var url = this.request.url;
		var template = Interpreter.VIEW;
		var target = url;
		var status = this.request.status;
		
		if (status > 299) { // return an error page
			target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
		} else { // find a template
			if (url.indexOf("!") != -1) {
				url = url.split("!");
				template = url[0];
				target = this.query = url[1];
			} else {
				// find a template
				var path = url.split("/");
				do {
					path.pop();
					template = path.join("/") + Interpreter.VIEW;
				} while (path.length && !this.exists(template));
				if (this.isDirectory(target) && this.exists(target + Interpreter.DEFAULT)) {
					target += Interpreter.DEFAULT;
				}
			}
		}
		return this.exec(template, target);
	}
}, {
	DEFAULT:   "default",
	VIEW:       "/system/view",
//	EDIT:      "/system/edit",
//	CREATE:    "/system/create",
	ERROR:     "/system/Error/",
	ERROR_PAGES: {
		"301": "Moved_Permanently",
		"404": "Not_Found",
		"405": "Method_Not_Allowed",
		"500": "Internal_Server_Error"
	}
});
