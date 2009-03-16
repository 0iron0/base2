
var dropdown = control.extend({
  extend: function(_interface) {
    var dropdown = this.base(_interface);
    if (!PopupWindow.ancestorOf(dropdown.Popup)) {
      dropdown.Popup = this.Popup.extend(dropdown.Popup);
    }
    return dropdown;
  },

  "@MSIE.+win": _MSIEShim,
  
  // properties

  appearance: "dropdown",

  Popup: PopupWindow, // popup class
  
  // events

  onblur: function(element, event) {
    if (this.isOpen(element) && !this.popup.isActive()) this.hidePopup();
    this.base(element, event);
  },
  
  "@Opera(8|9.[0-4])": {
    onblur: function(element, event) {
      if (this.isOpen(element) && this.popup.isActive()) {
        event.preventDefault();
      } else {
        this.base(element, event);
      }
    }
  },

  onkeydown: function(element, event, keyCode) {
    if (this.isEditable(element)) {
      if (keyCode == 40 && !this.isOpen(element)) {
        this.showPopup(element);
      } else if (this.isOpen(element)) {
        this.popup.onkeydown(event);
      }
    }
  },

  onmousedown: function(element, event, x) {
    this.base.apply(this, arguments);
    if (this.isEditable(element)) {
      if (this.hitTest(element, x)) {
        if (this.isOpen(element)) {
          this.hidePopup();
        } else {
          this.showPopup(element);
        }
      } else {
        this.hidePopup();
      }
    }
  },

  // methods

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if (element == control._active && control._activeThumb) {
      state = "active";
    } else if (element == control._hover && control._hoverThumb) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  },

  hidePopup: function(element) {
    if (this.popup) this.popup.hide();
  },

  isOpen: function(element) {
    var popup = this.popup;
    return popup && popup.isOpen() && popup.element == element;
  },

  showPopup: function(element) {
    if (!this.popup) this.popup = new this.Popup(this);
    this.popup.show(element);
  },

  "@theme=aqua": {
    "@borderImage": {
      hitTest: function(element, x) {
        return x >= element.clientWidth;
      }
    },

    layout: function(element) {
      this.syncCursor(element);
    }
  }
});
