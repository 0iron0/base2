
// avoid memory leaks

if (MSIE && window.attachEvent) {
	var $closures = {}; // all closures stored here
	
	BOM.$bind = function(method, element) {
		if (!element || element.nodeType != 1) {
			return method;
		}
		
		// unique id's for element and function
		var $element = element.uniqueID;
		var $method = assignID(method);
		
		// store the closure in a manageable scope
		$closures[$method] = method;			
		if (!$closures[$element]) $closures[$element] = {};		
		var closure = $closures[$element][$method];
		if (closure) return closure; // already stored
		
		// reset pointers
		element = null;
		method = null;
		
		// return a new closure with a manageable scope 
		var bound = function() {
			var element = document.all[$element];
			if (element) return $closures[$method].apply(element, arguments);
		};
		bound.cloneID = $method;
		$closures[$element][$method] = bound;
		return bound;
	};
	
	attachEvent("onunload", function() {
		$closures = null; // closures are destroyed when the page is unloaded
	});
}
