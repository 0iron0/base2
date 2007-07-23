
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var EventTarget = Interface.extend({
	"@!(element.addEventListener)": {
		addEventListener: function(target, type, listener, capture) {
			// assign a unique id to both objects
			var targetID = assignID(target);
			var listenerID = listener._cloneID || assignID(listener);
			// create a hash table of event types for the target object
			var events = EventTarget.$all[targetID];
			if (!events) events = EventTarget.$all[targetID] = {};
			// create a hash table of event listeners for each object/event pair
			var listeners = events[type];
			var current = target["on" + type];
			if (!listeners) {
				listeners = events[type] = {};
				// store the existing event listener (if there is one)
				if (current) listeners[0] = current;
			}
			// store the event listener in the hash table
			listeners[listenerID] = listener;
			if (current !== undefined) {
				target["on" + type] = delegate(EventTarget.$handleEvent);
			}
		},
	
		dispatchEvent: function(target, event) {
			return EventTarget.$handleEvent(target, event);
		},
	
		removeEventListener: function(target, type, listener, capture) {
			// delete the event listener from the hash table
			var events = EventTarget.$all[target.base2ID];
			if (events && events[type]) {
				delete events[type][listener.base2ID];
			}
		},
		
		"@MSIE.+win": {
			addEventListener: function(target, type, listener, capture) {
				// avoid memory leaks
				if (typeof listener == "function") {
					listener = bind(listener, target);
				}
				this.base(target, type, listener, capture);
			},
			
			dispatchEvent: function(target, event) {
				event.target = target;
				try {
					return target.fireEvent(event.type, event);
				} catch (error) {
					// the event type is not supported
					return this.base(target, event);
				}
			}
		}
	}
}, {	
	dispatchEvent: function(target, event) {
		// a little sugar
		if (typeof event == "string") {
			var type = event;
			event = DocumentEvent.createEvent(target, "Events");
			Event.initEvent(event, type, false, false);
		}
		this.base(target, event);
	},
	
	"@!(element.addEventListener)": {
		$all : {},
	
		$handleEvent: function(target, event) {
			var returnValue = true;
			// get a reference to the hash table of event listeners
			var events = EventTarget.$all[target.base2ID];
			if (events) {
				event = Event.bind(event); // fix the event object
				var listeners = events[event.type];
				// execute each event listener
				for (var i in listeners) {
					var listener = listeners[i];
					// support the EventListener interface
					if (listener.handleEvent) {
						returnValue = listener.handleEvent(event);
					} else {
						returnValue = listener.call(target, event);
					}
					if (event.returnValue === false) returnValue = false;
					if (returnValue === false) break;
				}
			}
			return returnValue;
		},
		
		"@MSIE": {	
			$handleEvent: function(target, event) {
				if (target.Infinity) {
					target = target.document.parentWindow;
					if (!event) event = target.event;
				}
				return this.base(target, event || Traversal.getDefaultView(target).event);
			}
		}
	}
});
