
var dropdown = control.extend({
  // properties

  Popup: Popup, // popup class
  
  appearance: "dropdown",
  
  "@theme=luna\\/blue": {
    imageWidth: 15
  },
  
  // events

  onblur: function(element, event) {
    console2.log("BLUR");
    if (this.isOpen(element) && !this._popup.active) this.hidePopup();
    this.base(element, event);
  },
  
  "@Opera(8|9.[0-4])": {
    onblur: function(element, event) {
      if (this.isOpen(element) && this.matchesSelector(this._popup.body, ":hover")) {
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
        this._popup.onkeydown(event);
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
  
  extend: function(_interface) {
    var dropdown = this.base(_interface);
    if (!Popup.ancestorOf(dropdown.Popup)) {
      dropdown.Popup = this.Popup.extend(dropdown.Popup);
    }
    return dropdown;
  },

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
    if (this._popup) this._popup.hide();
  },

  isOpen: function(element) {
    var popup = this._popup;
    return popup && popup.isOpen() && popup.element == element;
  },

  showPopup: function(element) {
    if (!this._popup) this._popup = new this.Popup(this);
    this._popup.show(element);
  },

  "@theme=aqua": {
    onmousedown: function(element) {
      this.base.apply(this, arguments);
      if (control._activeThumb) {
        this.addClass(element, this.appearance + _ACTIVE);
      }
    },
    
    onmouseup: function(element) {
      this.base.apply(this, arguments);
      this.removeClass(element, this.appearance + _ACTIVE);
    },

    hitTest: function(element, x) {
      return x >= element.clientWidth + 8;
    },

    "@Safari": {
      layout: function(element) {
        this.syncCursor(element);
      }
    }
  },

  "@MSIE.+win": _MSIEShim
});
