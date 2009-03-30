
// Store some state for HTML documents.
// Used for fixing event handlers and supporting the Selectors API.

var DocumentState = Base.extend({
  constructor: function(document) {
    this.document = document;
    this.events = {};
    this._hoverElement = document.documentElement;
    this.isBound = function() {
      return !!DOM.bind[document.base2ID];
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
    return this["on" + event.type](event);
  },

  onblur: function(event) {
    delete this._focusElement;
  },

  onmouseover: function(event) {
    this._hoverElement = event.target;
  },

  onmouseout: function(event) {
    delete this._hoverElement;
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
        event.target = event.target || event.srcElement || document;
        dispatcher.handleEvent(event);
      };
      this.handleEvent = function(event) {
        if (this["on" + event.type]) {
          this["on" + event.type](event);
        }
        return dispatcher.handleEvent(event);
      };
    },

    registerEvent: function(type, target) {
      var events = this.events[type];
      var canDelegate = _CAN_DELEGATE.test(type);
      if (!events || !canDelegate) {
        if (!events) events = this.events[type] = {};
        if (canDelegate || !target) target = this.document;
        this.addEvent(type, target);
      }
      return events;
    },

    addEvent: function(type, target) {
      var state = this;
      target["on" + type] = function(event) {
        if (!event) {
          event = Traversal.getDefaultView(this).event;
        }
        if (event) state.handleEvent(event);
      };
    },

    "@MSIE.+win": {
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

      fireEvent: function(type, event) {
        event = Event.cloneEvent(event);
        event.type = type;
        this.handleEvent(event);
      },

      addEvent: function(type, target) {
        if (target["on" + type] !== undefined) {
          var state = this;
          target.attachEvent("on" + type, function(event) {
            event.target = event.srcElement || target;
            state.handleEvent(event);
            if (state["after" + type]) {
              state["after" + type](event);
            }
          });
        }
      },

      onDOMContentLoaded: function(event) {
        forEach (event.target.forms, this._registerForm, this);
        this.setFocus(this.document.activeElement);
      },

      onmousedown: function(event) {
        this.base(event);
        this._button = event.button;
      },

      onmouseup: function(event) {
        this.base(event);
        if (this._button == null) {
          this.fireEvent("mousedown", event);
        }
        delete this._button;
      },

      aftermouseup: function() {
        if (this._selectEvent) {
          this._dispatch(this._selectEvent);
          delete this._selectEvent;
        }
      },

      onfocusin: function(event) {
        this.setFocus(event.target);
        this.onfocus(event);
      },

      setFocus: function(target) {
        var change = this.events.change && target.onchange !== undefined,
           select = this.events.select && target.onselect !== undefined;
        if (change || select) {
          var dispatch = this._dispatch;
          if (change) target.attachEvent("onchange", dispatch);
          if (select) {
            var state = this;
            var onselect = function(event) {
              if (state._activeElement == target) {
                state._selectEvent = copy(event);
              } else {
                dispatch(event);
              }
            };
            target.attachEvent("onselect", onselect);
          }
          target.attachEvent("onblur", function() {
            target.detachEvent("onblur", arguments.callee);
            if (change) target.detachEvent("onchange", dispatch);
            if (select) target.detachEvent("onselect", onselect);
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
        this.fireEvent("click", event);
      }
    }
  }
}, {
  init: function() {
    if (global.document) {
      assignID(document);
      DocumentState = this;
      this.createState(document);
      new DOMContentLoadedEvent(document);
    }
  },

  createState: function(document) {
    var base2ID = document.base2ID;
    if (!this[base2ID]) {
      this[base2ID] = new this(document);
    }
    return this[base2ID];
  },

  getInstance: function(node) {
    var document = Traversal.getDocument(node);
    return this[document.base2ID] || this.createState(document);
  }
});
