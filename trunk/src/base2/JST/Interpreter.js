
var Interpreter = Base.extend({
	constructor: function(command) {
		this.command = command || {};
		this.parser = new Parser;
	},
	
	command: null,
	parser: null,
	
	interpret: function(template) {
		var command = new Command(this.command);
		var code = base2.namespace + "with(arguments[0]){" +
			this.parser.parse(template) + 
		"}return arguments[0][1].join('')";
		// use new Function() instead of eval() so that the script is evaluated in the global scope
		return new Function(code)(command);
	}
});
