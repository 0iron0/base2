
var ComboBox = Chrome.extend({
  onmousedown: function(element, event, button) {
    if (!this.isEditable(element)) return;
    var BUTTON_LEFT = 1;
    if (!(button & BUTTON_LEFT)) return;
    if (!element._popup) {
      element._popup = this.createPopup(element);
    }
    if (element._popup) {
      if (this.hitTest(element)) {
        if (!element._popup.isOpen()) this.base();
        element._popup.toggle(element);
      }
    }
  },

  onkeydown: function(element, event, keyCode) {
    // up/down-arrows
    if (this.isEditable(element)) {
      var UP_DOWN = keyCode == 38 || keyCode == 40;
      if (!element._popup && UP_DOWN) {
        element._popup = this.createPopup(element);
      }
      if (element._popup) {
        if (keyCode == 27) {  // escape
          element._popup.hide();
        } else if (UP_DOWN && !element._popup.isOpen()) {
          element._popup.show(element);
          event.preventDefault();
        } else if (element._popup.isOpen()) {
          element._popup.onkeydown();
          event.preventDefault();
        } else this.base(element);
        return;
      }
    }
  },

  onkeyup: function(element) {
    if (this.isActive(element)) element._popup.onkeyup();
  }
}, {
  createPopup: function(element) {
    alert("createPopup");
  },

  isActive: function() {
    return element._popup && element._popup.isOpen();
  },

  getState: function () {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if (element._hoverThumb && element._activeThumb) {
      state = "active";
    } else if (element._hoverThumb &&  !this.isActive(element)) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  }
});
