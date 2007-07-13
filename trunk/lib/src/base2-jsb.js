// timestamp: Fri, 13 Jul 2007 17:39:34

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// JSB/namespace.js
// =========================================================================

var JSB = new base2.Namespace(this, {
	name:    "JSB",
	version: "0.6",
	imports: "DOM",
	exports: "Binding,Rule,RuleList"
});

eval(this.imports);

// =========================================================================
// JSB/Call.js
// =========================================================================
	
var Call = function(context, method, args, rank) {		
	this.call = function() {
		method.apply(context, args);
	};
	this.rank = rank || 100;
};

// =========================================================================
// JSB/System.js
// =========================================================================

var System = new Base({
	ready: false,
	_deferred: new Array2,

	defer: function(method, rank) {
		// defers a method call until DOMContentLoaded
		var deferred = function() {
			if (System._deferred) {
				System._deferred.push(new Call(this, method, arguments, rank));				
			} else {
				method.apply(this, arguments);
			}
		};
		return deferred;
	},
	
	onload: function() {
		// call deferred calls
		if (!System.ready) {
			System.ready = true;
			DOM.bind(document);
			System._deferred.sort(function(a, b) {
				return a.rank - b.rank;
			});
			System._deferred.invoke("call");
			delete System._deferred;
			setTimeout(function() { // jump out of the current event
				EventTarget.dispatchEvent(document, "ready");
			}, 0);
		}
	}
});

// initialise the system
EventTarget.addEventListener(document, "DOMContentLoaded", System.onload, false);

// =========================================================================
// JSB/Event.js
// =========================================================================

extend(Event, {
	PATTERN: /^on(DOMContentLoaded|[a-z]+)$/,
	
	cancel: function(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}
});

// =========================================================================
// JSB/HTMLElement.js
// =========================================================================

extend(HTMLElement.prototype, "extend", function(name, value) {
	// automatically attach event handlers when extending
	if (!Base._prototyping && Event.PATTERN.test(name) && typeof value == "function") {
		EventTarget.addEventListener(this, name.slice(2), value, false);
		return this;
	}
	if (arguments.length == 2 && name == "style") {
		extend(this.style, value);
		return this;
	}
	return base(this, arguments);
});

// =========================================================================
// JSB/EventTarget.js
// =========================================================================

extend(EventTarget, {	
	addEventListener: function(target, type, listener, useCapture) {
		// allow elements to pick up document events (e.g. ondocumentclick)
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			listener = bind(listener, target);
			target = Traversal.getDocument(target);
		}
		// call the default method
		this.base(target, type, listener, useCapture);
	},

	removeEventListener: function(target, type, listener, useCapture) {
		if (type.indexOf("document") == 0) {
			type = type.slice(8);
			target = Traversal.getDocument(target);
		}
		this.base(target, type, listener, useCapture);
	}
});

// =========================================================================
// JSB/Binding.js
// =========================================================================

// Remember: a binding is a function

var Binding = Abstract.extend();

// =========================================================================
// JSB/Rule.js
// =========================================================================

var Rule = Base.extend({
	constructor: function(selector, binding) {
		// create the selector object
		this.selector = instanceOf(selector, Selector) ?
			selector : new Selector(selector);
		// create the binding
		if (typeof binding != "function") {
			binding = Binding.extend(binding);
		}
		// create the bind method
		var bound = {}; // don't bind more than once
		this.bind = function(element) {
			var uid = assignID(element);
			if (!bound[uid]) {
				bound[uid] = true;
				binding(DOM.bind(element));
			}
		};
		this.apply();
	},
	
	selector: null,
	
	apply: System.defer(function() {
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this.selector.exec(document), this.bind);
	}),
	
	bind: function(element) {
		// defined in the constructor function
	},
	
	refresh: function() {
		this.apply();
	},
	
	toString: function() {
		return String(this.selector);
	}
});

// =========================================================================
// JSB/RuleList.js
// =========================================================================

// A collection of Rule objects

var RuleList = Collection.extend({
	constructor: function(rules) {
		this.base(rules);
		this.globalize(); //-dean: make this optional
	},
	
	globalize: System.defer(function() {
		var COMMA = /\s*,\s*/;
		var ID = /^#[\w-]+$/;
		// execution of this method is deferred until the DOMContentLoaded event
		forEach (this, function(rule, selector) {
			// add all ID selectors to the global namespace
			forEach (selector.split(COMMA), function(selector) {
				if (ID.test(selector)) {
					var name = ViewCSS.toCamelCase(selector.slice(1));
					window[name] = Document.matchSingle(document, selector);
				}
			});
		});
	}, 10),
	
	refresh: function() {
		this.invoke("refresh");
	}
}, {
	Item: Rule
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
