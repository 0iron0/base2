
// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoadedEvent = Base.extend({
  constructor: function(document) {
    var fired = false;
    this.fire = function() {
      if (!fired) {
        fired = true;
        // this function will be called from another event handler so we'll user a timer
        //  to drop out of any current event
        setTimeout(function() {
          var event = DocumentEvent.createEvent(document, "Events");
          Event.initEvent(event, "DOMContentLoaded", true, false);
          EventTarget.dispatchEvent(document, event);
        }, 1);
      }
    };
    // use the real event for browsers that support it (opera & firefox)
    EventTarget.addEventListener(document, "DOMContentLoaded", function() {
      fired = true;
    }, false);
    this.listen(document);
  },

  listen: Undefined,

  "@!Gecko20([^0]|0[3-9])|Webkit(4[2-9]|5-9)|Opera[19]|MSIE.+mac": {
    listen: function(document) {
      // if all else fails fall back on window.onload
      EventTarget.addEventListener(Traversal.getDefaultView(document), "load", this.fire, false);
    },

    "@MSIE.+win": {
      listen: function(document) {
        // http://javascript.nwbox.com/IEContentLoaded/
        try {
          document.body.doScroll("left");
          if (!this.__constructing) this.fire();
        } catch (e) {
          setTimeout(bind(this.listen, this, document), 10);
        }
      }
    },

    "@KHTML": {
      listen: function(document) {
        // John Resig
        if (/loaded|complete/.test(document.readyState)) { // loaded
          if (!this.__constructing) this.fire();
        } else {
          setTimeout(bind(this.listen, this, document), 10);
        }
      }
    }
  }
});
