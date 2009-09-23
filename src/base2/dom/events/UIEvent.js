
// NOT CURRENTLY USED.

var UIEvent = Event.extend({
  "@!(document.createEvent('UIEvents'))": {
    initUIEvent: function(event, type, bubbles, cancelable, view, detail) {
      this.initEvent(event, type, bubbles, cancelable);
      event.view = view;
      event.detail = detail;
    }
  }
});
