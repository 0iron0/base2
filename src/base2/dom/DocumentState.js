
// Store some state for HTML documents.
// Used for fixing event handlers and supporting the Selectors API.

var DocumentState = Base.extend({
  init: function(document) {
    this.document = document;
    this.events = {};
    this._hoverElement = document.documentElement;
    var EVENT_HANDLER = /^on((DOM)?\w+|[a-z]+)$/;
    forEach (this, function(method, name, documentState) {
      if (EVENT_HANDLER.test(name)) {
        documentState.registerEvent(name.slice(2));
      }
    });
  },

  hasFocus: function(element) {
    return element == this._focusElement;
  },

  isActive: function(element) {
    return Traversal.includes(element, this._activeElement);
  },

  isHover: function(element) {
    return Traversal.includes(element, this._hoverElement);
  },

  handleEvent: function(event) {
    if (!event._userGenerated) {
      this["on" + event.type](event);
    }
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

  "@!(document.activeElement)": {
    init: function(document) {
      this.base(document);
      if (dom.isBound(document)) {
        document.activeElement = document.body;
      }
    },

    onfocus: function(event) {
      this.base(event);
      if (dom.isBound(this.document)) {
        this.document.activeElement = this._focusElement;
      }
    },

    onblur: function(event) {
      this.base(event);
      if (dom.isBound(this.document)) {
        this.document.activeElement = this.document.body;
      }
    }
  },

  "@!(element.addEventListener)": {
    init: function(document) {
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

    registerEvent: function(type, target) { //-@DRE
      var events = this.events[type],
          targetIsWindow = target && target.Infinity,
          canDelegate = !targetIsWindow && !_CANNOT_DELEGATE.test(type);
      if (!events || !canDelegate) {
        if (!events) events = this.events[type] = {};
        if (canDelegate || !target) target = this.document;
        if (!target) target = this.document;
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

    "@(element.attachEvent)": {
      init: function(document) {
        this.base(document);
        var forms = {};
        this._registerForm = function(form) {
          var formID = assignID(form);
          if (!forms[formID]) {
            forms[formID] = true;
            _private.attachEvent(form, "onsubmit", this._dispatch);
            _private.attachEvent(form, "onreset", this._dispatch);
          }
        };
        var state = this;
        this._onselect = function(event) {
          if (state._activeElement == event.target) {
            state._selectEvent = copy(event);
          } else {
            state._dispatch(event);
          }
        };
      },
      
      registered: {},

      fireEvent: function(type, event) {
        event = Event.cloneEvent(event);
        event.type = type;
        this.handleEvent(event);
      },

      addEvent: function(type, target) {
        var key = assignID(target) + type;
        if (!this.registered[key] && target["on" + type] !== undefined) {
          this.registered[key] = true;
          var state = this;
          _private.attachEvent(target, "on" + type, function(event) {
            /*@if (@_jscript_version < 5.6)
            if (event.srcElement && !event.srcElement.nodeName) return;
            /*@end @*/
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
        this.activate(this.document.activeElement);
      },

      onmousedown: function(event) {
        this.base(event);
        this._button = event.button;
      },

      onmouseup: function(event) {
        this.base(event);
        if (!event._userGenerated && this._button == null) {
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
        this.activate(event.target);
        this.onfocus(event);
      },

      activate: function(element) {
        var change = this.events.change && element.onchange !== undefined,
           select = this.events.select && element.onselect !== undefined;
        if (change || select) {
          var dispatch = this._dispatch, onselect = this._onselect;
          if (change) _private.attachEvent(element, "onchange", dispatch);
          if (select) _private.attachEvent(element, "onselect", onselect);
          var onblur = function() {
            _private.detachEvent(element, "onblur", onblur, true);
            if (change) _private.detachEvent(element, "onchange", dispatch);
            if (select) _private.detachEvent(element, "onselect", onselect);
          };
          _private.attachEvent(element, "onblur", onblur);
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
        if (!event._userGenerated) this.fireEvent("click", event);
      },

      "@!(element.onfocusin)": {
        init: function(document) {
          this.base(document);
          var state = this, activeElement = document.activeElement;
          _private.attachEvent(document, "onpropertychange", function(event) {
            if (event.propertyName == "activeElement") {
              if (activeElement) {
                _private.attachEvent(activeElement, "onblur", onblur);
              }
              activeElement = document.activeElement;
              if (activeElement) {
                _private.attachEvent(activeElement, "onfocus", onfocus);
                state.activate(activeElement);
              }
            }
          });
          function onfocus(event) {
            _private.detachEvent(event.srcElement, "onfocus", onfocus);
            event.target = event.srcElement;
            state.handleEvent(event);
          };
          function onblur(event) {
            _private.detachEvent(event.srcElement, "onblur", onblur);
            event.target = event.srcElement;
            state.handleEvent(event);
          };
        }
      }
    }
  }
}, {
  createState: function(document) {
    var base2ID = assignID(document);
    if (!this[base2ID] && !Traversal.isXML(document)) {
      this[base2ID] = new this();
      this[base2ID].init(document);
    }
    return this[base2ID];
  },

  getInstance: function(node) {
    var document = Traversal.getDocument(node);
    return this[document.base2ID] || this.createState(document);
  }
});

DocumentState.createState(document);
new DOMContentLoadedEvent(document);
