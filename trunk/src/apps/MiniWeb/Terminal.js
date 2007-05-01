
// It didn't start off that way but this is becoming more like the UNIX shell
//  (which I know very little about)

var Terminal = Command.extend({
	constructor: function() {
		this.base();
		Terminal.load(this);
		this.extend("exec", function() {
			try {
				return base(this, arguments);
			} catch (error) {
				return String(error.message || error);
			}
		});
	}
}, {
	STATE: "#state",
	TMP:   "~terminal",
	
	load: function(terminal) {
		// the state of a terminal session is saved to disk whenever
		//  MiniWeb is saved from the terminal. Reload the saved
		//  state.
		if (!MiniWeb.readOnly && LocalFile.exists(this.TMP)) {
			var state = JSON.parse(LocalFile.read(this.TMP));
			LocalFile.remove(this.TMP);
		} else {
			state = {
				commands: [],
				output:   "<pre>" + MiniWeb + "</pre><br>",
				path:     "/",
				position: 0,
				protocol: "json:"
			};
		}
		terminal.protocol = state.protocol;
		terminal.path = state.path;
		terminal[this.STATE] = state;
	},
	
	save: function(terminal) {
		// save the state of a terminal session to disk
		var state = terminal[this.STATE];
		state.protocol = terminal.protocol;
		state.path = terminal.path;
		if (!MiniWeb.readOnly) {
			LocalFile.write(this.TMP, JSON.toString(state));
		}
	}
});
