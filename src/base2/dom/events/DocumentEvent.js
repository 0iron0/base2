
// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent

var DocumentEvent = Interface.extend({  
  "@!(document.createEvent)": {
    createEvent: function(document, type) {
      return Event({
        bubbles: false,
        cancelable: false,
        eventPhase: 0,
        target: document,
        currentTarget: null,
        relatedTarget: null,
        timeStamp: new Date().valueOf()
      });
    }
  },
  
  "@(document.createEvent)": {
    "@!(document.createEvent('Events'))": { // before Safari 3
      createEvent: function(document, type) {
        return this.base(document, type == "Events" ? "UIEvents" : type);
      }
    }
  }
});
