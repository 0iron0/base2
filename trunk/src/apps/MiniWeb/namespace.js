/*
	MiniWeb - copyright 2007, Dean Edwards
	http://www.opensource.org/licenses/mit-license
*/

// An active document thing

MiniWeb = new base2.Namespace(this, {
	name:    "MiniWeb",
	exports: "Request",
	imports: "IO",
	version: "0.5",
	
	DOCTYPE: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
	SCRIPT: '<script type="text/javascript">%1<\/script>',
	
	client: null,
	data: null,
	dirty: false,
	readOnly: true,
	server: null,
	terminal: null,
	
	init: function() {
		// create page style
		document.write("<style>html,body{margin:0;padding:0;height:100%;overflow:hidden}#window{width:100%;height:100%;}</style>");
		
		// delegate some methods to the client
		var methods = "navigateTo,refresh,reload,submit".split(",");
		base2.forEach (methods, function(method) {
			this[method] = function() {
				var args = arguments;
				var client = MiniWeb.client;
				// use a timer to jump out of an event
				setTimeout(function() {
					client[method].apply(client, args);
				}, 0);
			};
		}, this);
		
		window.onload = function() {
			MiniWeb.server = new Server;
			// get server options
			var request = new Request("OPTIONS");
			var allow = request.getResponseHeader("Allow");
			MiniWeb.readOnly = !/PUT/.test(allow);
			MiniWeb.terminal = new Terminal;
			MiniWeb.client = new Client;
		};
	},
	
	register: function(window) {
		this.client.register(window);
	},
	
	resolve: function(path, filename) {
		return IO.FileSystem.resolve(path, filename);
	},
	
	save: function(name) {
		if (this.readOnly) {
			alert(
				"You cannot save your changes over HTTP.\n" +
				"Instead, save this page to your hard disk.\n" +
				"If you edit the local version you will then\n" +
				"be able to save your changes."
			);
		} else {
			// update the revision number of the document
			var REVISION = "/system/About/revision";
			var io = this.server.io;
			var revision = parseInt(io.read(REVISION));
			io.write(REVISION, String(++revision));
			
			// save the state of the terminal
			if (!name) Terminal.save(this.terminal);
		
			// stringify JSON data
			var json = "MiniWeb.data=" + JSON.toString(this.data).replace(/<\//g, "<\\/");
			
			// the source of the MiniWeb engine
			var src = document.getElementsByTagName("script")[0].src;
			
			// it's mostly script :-)
			var html = [
				this.DOCTYPE,
				"<head>",
				"<title>" + document.title + "<\/title>",
				format('<script type="text/javascript" src="%1"><\/script>', src),
				format(this.SCRIPT, json),
				"<body>"
			].join("\n");
			
			if (!name) LocalFile.backup(location.pathname);
			LocalFile.write(name || location.pathname, html);
			if (!name) location.reload();
			return true;
		}
	},
	
	send: function(request, data) {
		if (this.client) {
			request.referer = this.client.address;
		}
		this.server.respond(request, data);
	}
});

eval(this.imports);

MiniWeb.toString = function() {
	return "MiniWeb version " + MiniWeb.version;
};
