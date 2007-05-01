
// http://www.whatwg.org/specs/web-apps/current-work/#getelementsbyclassname

var HTMLElement = Element.extend({
	addClass: function(element, className) {
		if (!this.hasClass(element, className)) {
			element.className += (element.className ? " " : "") + className;
			return className;
		}
	},
	
	hasClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return regexp.test(element.className);
	},

	removeClass: function(element, className) {
		var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)");
		element.className = element.className.replace(regexp, "$2");
		return className;
	},
	
	"@!(element.getElementsByClassName)": { // firefox3?
		getElementsByClassName: function(element, classNames) {
			return this.matchAll(element, "." + classNames.join("."));
		}
	}	
}, {
	bindings: {},
	tags: "*",
	
	extend: function() {
		// maintain HTML element bindings.
		// this allows us to map specific interfaces to elements by reference
		// to tag name.
		var binding = base(this, arguments);
		var tags = (binding.tags || "").toUpperCase().split(",");
		forEach (tags, function(tagName) {
			HTMLElement.bindings[tagName] = binding;
		});
		return binding;
	},
	
	"@!(element.ownerDocument)": {
		bind: function(element) {
			this.base(element);
			element.ownerDocument = Traversal.getOwnerDocument(element);
			return element;
		}
	}
});
