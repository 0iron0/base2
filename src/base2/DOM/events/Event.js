
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({	
	"@!(document.createEvent)": {
		initEvent: function(event, type, bubbles, cancelable) {
			event.type = type;
			event.bubbles = bubbles;
			event.cancelable = cancelable;
		},
		
		"@MSIE": {
			initEvent: function(event) {
				base(this, arguments);
				event.cancelBubble = !event.bubbles;
			},
			
			preventDefault: function(event) {
				if (event.cancelable !== false) {
					event.returnValue = false;
				}
			},
		
			stopPropagation: function(event) {
				event.cancelBubble = true;
			}
		}
	}
}, {
	"@MSIE": {
/*		bind: function(event) {
			//-dean: put more fixes here
			return this.base(event);
		}, */
		
		"@Mac": {
			bind: function(event) {
				// Mac IE5 does not allow expando properties on the event object so
				//  we copy the object instead.
				return this.base(extend({
					preventDefault: function() {
						if (this.cancelable !== false) {
							this.returnValue = false;
						}
					}
				}, event));
			}
		},
		
		"@Windows": {
			bind: function(event) {
				this.base(event);
				event.target = event.srcElement;
				return event;
			}
		}
	}
});
