
var Call = Base.extend({
  constructor: function(context, method, args, rank) {
    this.release = function() {
      method.apply(context, args);
    };
    this.rank = rank || (100 + Call.list.length);
  }
}, {
  list: [],
  
  defer: function(method, rank) {
    // defers a method call until DOMContentLoaded
    return function() {
      if (Call.list) {
        Call.list.push(new Call(this, method, arguments, rank));
      } else {
        method.apply(this, arguments);
      }
    };
  },
  
  init: function() {
    EventTarget.addEventListener(document, "DOMContentLoaded", function() {
      _bind = DOM.bind[document.base2ID];
      // release deferred calls
      if (Call.list) {
        Call.list.sort(function(a, b) {
          return a.rank - b.rank;
        });
        invoke(Call.list, "release");
        delete Call.list;
        setTimeout(function() { // jump out of the current event
          var event = DocumentEvent.createEvent(document, "Events");
          Event.initEvent(event, "ready", false, false);
          EventTarget.dispatchEvent(document, event);
        }, 1);
      }
    }, false);
  }
});
