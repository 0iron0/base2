
// avoid memory leaks

if (BOM.detect("MSIE[56].+win") && !BOM.detect("SV1")) {
	var $closures = {}; // all closures stored here
	
	extend(lang.bind, function(method, element) {
		if (!element || element.nodeType != 1) {
			return this.base(method, element);
		}
		
		// unique id's for element and function
		var $element = element.uniqueID;
		var $method = assignID(method);
		
		// store the closure in a manageable scope
		$closures[$method] = method;
		
		// reset pointers
		element = null;
		method = null;
		
		if (!$closures[$element]) $closures[$element] = {};
		var closure = $closures[$element][$method];
		if (closure) return closure; // already stored
		
		// return a new closure with a manageable scope 
		var bound = function() {
			var element = document.all[$element];
			if (element) return $closures[$method].apply(element, arguments);
		};
		bound.cloneID = $method;
		$closures[$element][$method] = bound;
		return bound;
	});
	
	attachEvent("onunload", function() {
		$closures = null; // closures are destroyed when the page is unloaded
	});
}
