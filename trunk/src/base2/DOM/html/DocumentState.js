
// Store some state for HTML documents.
// Used for fixing event handlers and supporting the Selectors API.

var DocumentState = Base.extend({
  constructor: function(document) {
    this.document = document;
    this.events = {};
    this._hoverElement = document.documentElement;
    this.isBound = function() {
      return DOM.bind[document.base2ID];
    };
    forEach (this, function(method, name, documentState) {
      if (/^on((DOM)?\w+|[a-z]+)$/.test(name)) {
        documentState.registerEvent(name.slice(2));
      }
    });
  },

  includes: function(element, target) {
    return target && (element == target || Traversal.contains(element, target));
  },

  hasFocus: function(element) {
    return element == this._focusElement;
  },

  isActive: function(element) {
    return this.includes(element, this._activeElement);
  },

  isHover: function(element) {
    return this.includes(element, this._hoverElement);
  },
  
  handleEvent: function(event) {
    this["on" + event.type](event);
  },

  onblur: function(event) {
    delete this._focusElement;
  },

  onmouseover: function(event) {
    this._hoverElement = event.target;
  },

  onmousedown: function(event) {
    this._activeElement = event.target;
  },

  onfocus: function(event) {
    this._focusElement = event.target;
  },

  onmouseup: function(event) {
    delete this._activeElement;
  },

  registerEvent: function(type) {
    this.document.addEventListener(type, this, true);
    this.events[type] = true;
  },
  
  "@(document.activeElement===undefined)": {
    constructor: function(document) {
      this.base(document);
      if (this.isBound()) {
        document.activeElement = document.body;
      }
    },

    onfocus: function(event) {
      this.base(event);
      if (this.isBound()) {
        this.document.activeElement = this._focusElement;
      }
    },

    onblur: function(event) {
      this.base(event);
      if (this.isBound()) {
        this.document.activeElement = this.document.body;
      }
    }
  },

  "@!(element.addEventListener)": {
    constructor: function(document) {
      this.base(document);
      var dispatcher = new EventDispatcher(this);
      this._dispatch = function(event) {
        dispatcher.handleEvent(event);
      };
      this.handleEvent = function(event) {
        if (this["on" + event.type]) {
          this["on" + event.type](event);
        }
        dispatcher.handleEvent(event);
      };
    },
    
    registerEvent: function(type) {
      var events = this.events[type];
      if (!events) {
        var state = this;
        state.document["on" + type] = function(event) {
          if (!event) {
            event = Traveral.getDefaultiew(this).event;
          }
          if (event) state.handleEvent(event);
        };
        events = this.events[type] = {};
      }
      return events;
    }
  },

  "@MSIE": {
    constructor: function(document) {
      this.base(document);
      var forms = {};
      this._registerForm = function(form) {
        var formID = assignID(form);
        if (!forms[formID]) {
          forms[formID] = true;
          form.attachEvent("onsubmit", this._dispatch);
          form.attachEvent("onreset", this._dispatch);
        }
      };
    },
    
    registerEvent: function(type) {
      var events = this.events[type];
      if (!events) {
        var state = this;
        state.document.attachEvent("on" + type, function(event) {
          event.target = event.srcElement || state.document;
          state.handleEvent(event);
        });
        events = this.events[type] = {};
      }
      return events;
    },

    onDOMContentLoaded: function(event) {
      forEach (event.target.forms, this._registerForm, this);
    },

    onmousedown: function(event) {
      this.base(event);
      this._button = event.button;
    },

    onmouseup: function(event) {
      this.base(event);
      if (this._button == null) {
        event.target.fireEvent("onmousedown", event);
      }
      delete this._button;
    },

    onfocusin: function(event) {
      this.onfocus(event);
      var target = event.target;
      if (target.value !== undefined) {
        var dispatch = this._dispatch;
        target.attachEvent("onchange", dispatch);
        target.attachEvent("onblur", function() {
          target.detachEvent("onblur", arguments.callee);
          target.detachEvent("onchange", dispatch);
        });
      }
    },

    onfocusout: function(event) {
      this.onblur(event);
    },

    onclick: function(event) {
      var target = event.target;
      if (target.form) this._registerForm(target.form);
    },

    ondblclick: function(event) {
      event.target.fireEvent("onclick", event);
    }
  }
}, {
  init: function() {
    assignID(document);
    this.createState(document);
    DocumentState = this; // a flaw in base2 :-)
    new DOMContentLoadedEvent(document);
  },

  createState: function(document) {
    var base2ID = document.base2ID;
    if (!this[base2ID]) {
      this[base2ID] = new this(document);
    }
    return this[base2ID];
  },

  getInstance: function(target) {
    return this[Traversal.getDocument(target).base2ID];
  }
});

