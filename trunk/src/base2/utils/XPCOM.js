
// Some useful methods for dealing with XPCOM.

var XPCOM = Module.extend({
  privelegedMethod: I, // no such thing as priveleged for non-Mozilla browsers
  privelegedObject: I,
  
  "@(Components)": {
    createObject: function(classPath, interfaceId) {
      if (classPath.indexOf("@") != 0) {
        classPath = "@mozilla.org/" + classPath;
      }
      try {
        return new (new Components.Constructor(classPath, interfaceId));
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
