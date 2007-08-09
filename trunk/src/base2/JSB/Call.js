
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
      // release deferred calls
      if (Call.list) {
        DOM.bind(document);
        Call.list.sort(function(a, b) {
          return a.rank - b.rank;
        });
        invoke(Call.list, "release");
        delete Call.list;
        setTimeout(function() { // jump out of the current event
          EventTarget.dispatchEvent(document,'ready');
        }, 0);
      }
    }, false);
  }
});
