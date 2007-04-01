	
var Call = function(context, method, args, rank) {		
	this.call = function() {
		method.apply(context, args);
	};
	this.rank = rank || 100;
};
