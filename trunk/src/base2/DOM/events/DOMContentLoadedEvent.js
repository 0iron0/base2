
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
          Event.initEvent(event, "DOMContentLoaded", false, false);
          EventTarget.dispatchEvent(document, event);
        }, 1);
      }
    };
    // use the real event for browsers that support it (opera & firefox)
    EventTarget.addEventListener(document, "DOMContentLoaded", function() {
      fired = true;
    }, false);
    // if all else fails fall back on window.onload
    EventTarget.addEventListener(Traversal.getDefaultView(document), "load", this.fire, false);
  },

  "@(attachEvent)": {
    constructor: function() {
      this.base(document);
      Traversal.getDefaultView(document).attachEvent("onload", this.fire);
    }
  },

  "@MSIE.+win": {
    constructor: function(document) {
      this.base(document);
      if (document.readyState != "complete") {
        // Matthias Miller/Mark Wubben/Paul Sowden/Me
        var event = this;
        document.write("<script id=__ready defer src=//:><\/script>");
        document.all.__ready.onreadystatechange = function() {
          if (this.readyState == "complete") {
            this.removeNode(); // tidy
            event.fire();
          }
        };
      }
    }
  },
  
  "@KHTML": {
    constructor: function(document) {
      this.base(document);
      // John Resig
      if (document.readyState != "complete") {
        var event = this;
        var timer = setInterval(function() {
          if (/loaded|complete/.test(document.readyState)) {
            clearInterval(timer);
            event.fire();
          }
        }, 100);
      }
    }
  }
});
