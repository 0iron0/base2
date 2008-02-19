
// Store some state for bound documents.
// Used for fixing event handlers and supporting the Selectors API.

var _documentState = new Base({
  hover: function(document, element) {
    var state = this[document.base2ID];
    return (element == state.mouseover) || Traversal.contains(element, state.mouseover);
  },

  active: function(document, element) {
    var state = this[document.base2ID];
    return element == state.mousedown || Traversal.contains(element, state.mousedown);
  },

  focus: function(document, element) {
    return element == (document.activeElement || this[document.base2ID].focus || document.body)
  },

  register: function(document) {
    var state = this[document.base2ID] = {};
    forEach ({
      blur: "focus",
      mouseup: "mousedown",
      mouseout: "mouseover"
    }, function(before, after) {
        EventTarget.addEventListener(document, before, function(event) {
          state[before] = event.target;
        }, true);
        EventTarget.addEventListener(document, after, function() {
          delete state[before];
        }, true);
    });
    
    return state;
  },
  
  "@MSIE": {
    register: function(document) {
      var click;
      var state = this.base(document);
      document.attachEvent("onmousedown", function(event) {
        // Rememeber the button for click events.
        state._button = event.button;
        delete state._click;
      });
      document.attachEvent("onmouseup", function(event) {
        if (event.srcElement == state._click) {
          event.srcElement.fireEvent("onclick", event);
        }
        delete state._click;
      });
      document.attachEvent("onclick", function() {
        state._click = event.srcElement;
      });
    }
  }
});

assignID(document);
_documentState.register(document);
