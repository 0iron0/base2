
// some useful methods for dealing with XPCOM

var XPCOM = new Base({
	privelegedMethod: K, // no such thing as priveleged for non-Mozilla browsers
	privelegedObject: K,
	
	"@(Components)": {
		createObject: function(classPath, interfaceId) {
			try {
				var _class = Components.classes["@mozilla.org/" + classPath];
				var _interface = Components.interfaces[interfaceId];
				return _class.createInstance(_interface);
			} catch (error) {
				throw new Error(format("Failed to create object '%1' (%2).", interfaceId, error.message));
			}
		},
		
		privelegedMethod: function(method) {
			return function() {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				return method.apply(this, arguments);
			};
		},
		
		privelegedObject: function(object) {
			Base.forEach (object, function(method, name) {
				if (typeof method == "function") {
					object[name] = XPCOM.privelegedMethod(method);
				}
			});
		}
	}
});
