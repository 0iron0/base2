
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

// TO DO: event capture

var EventTarget = Interface.extend({
	"@!(element.addEventListener)": {
		addEventListener: function(target, type, listener, useCapture) {
			// assign a unique id to both objects
			var $target = assignID(target);
			var $listener = listener.cloneID || assignID(listener);
			// create a hash table of event types for the target object
			var events = this.$all[$target];
			if (!events) events = this.$all[$target] = {};
			// create a hash table of event listeners for each object/event pair
			var listeners = events[type];
			var current = target["on" + type];
			if (!listeners) {
				listeners = events[type] = {};
				// store the existing event listener (if there is one)
				if (current) listeners[0] = current;
			}
			// store the event listener in the hash table
			listeners[$listener] = listener;
			if (current !== undefined) {
				target["on" + type] = this.$dispatch;
			}
		},
	
		dispatchEvent: function(target, event) {
			this.$dispatch.call(target, event);
		},
	
		removeEventListener: function(target, type, listener, useCapture) {
			// delete the event listener from the hash table
			var events = this.$all[target.base2ID];
			if (events && events[type]) {
				delete events[type][listener.base2ID];
			}
		},
		
		"@MSIE.+win": {
			addEventListener: function(target, type, listener, useCapture) {
				// avoid memory leaks
				if (typeof listener == "function") {
					listener = bind(listener, target)
				}
				this.base(target, type, listener, useCapture);
			},
			
			dispatchEvent: function(target, event) {
				event.target = target;
				try {
					target.fireEvent(event.type, event);
				} catch (error) {
					// the event type is not supported
					this.base(target, event);
				}
			}
		}
	}
}, {
	// support event dispatch	
	"@!(element.addEventListener)": {
		$all : {},
		
		$dispatch: function(event) {
			var returnValue = true;
			// get a reference to the hash table of event listeners
			var events = EventTarget.$all[this.base2ID];
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
						returnValue = listener.call(this, event);
					}
					if (event.returnValue === false) returnValue = false;
					if (returnValue === false) break;
				}
			}
			return returnValue;
		},
	
		"@MSIE": {
			$dispatch: function(event) {
				if (!event) {
					event = (this.Infinity ? window : Traversal.getDefaultView(this)).event;
				}
				return this.base(event);
			}
		}
	}
});
