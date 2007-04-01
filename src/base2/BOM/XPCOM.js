
// some useful methods for dealing with XPCOM

BOM.extend({
	$privelegedMethod: K, // no such thing as priveleged for non-Mozilla browsers
	$privelegedObject: K,
	
	"@(Components)": {
		$createObject: function(classPath, interfaceId) {
			try {
				var _class = Components.classes["@mozilla.org/" + classPath];
				var _interface = Components.interfaces[interfaceId];
				return _class.createInstance(_interface);
			} catch (error) {
				throw new Error("Failed to create object '" + interfaceId + "' (" + error.message + ").");
			}
		},
		
		$privelegedMethod: function(method) {
			return function() {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				return method.apply(this, arguments);
			};
		},
		
		$privelegedObject: function(object) {
			Base.forEach(object, function(method, name) {
				if (instanceOf(method, Function)) {
					object[name] = BOM.$privelegedMethod(method);
				}
			});
		}
	}
});
