
var ComboBox = Chrome.modify({
  appearance: "menulist",
  
  onmousedown: function(element, event, x) {
    base(this, arguments);
    if (this.isEditable(element)) {
      if (!Chrome._popup) {
        Chrome._popup = this.createPopup();
      }
      if (Chrome._popup) {
        if (this.hitTest(element, x)) {
          if (Chrome._popup.isOpen) {
            Chrome._popup.hide();
          } else {
            Chrome._popup.show(element);
          }
        }
      }
    }
  },

  onkeydown: function(element, event, keyCode) {
    // up/down-arrows
    if (this.isEditable(element)) {
      var UP_DOWN = keyCode == 38 || keyCode == 40;
      if (!Chrome._popup && UP_DOWN) {
        Chrome._popup = this.createPopup();
      }
      if (Chrome._popup) {
        if (keyCode == 27) {  // escape
          Chrome._popup.hide();
        } else if (UP_DOWN && !Chrome._popup.isOpen) {
          Chrome._popup.show(element);
          event.preventDefault();
        } else if (Chrome._popup.isOpen) {
          Chrome._popup.onkeydown();
          event.preventDefault();
        }
        return;
      }
    }
  },

  onkeyup: function(element) {
    if (this.isActive(element)) Chrome._popup.onkeyup();
  },
  
  "@MSIE": {
    onfocus: function(element) {
      base(this, arguments);
      element.attachEvent("onpropertychange", change);
      element.attachEvent("onblur", function() {
        element.detachEvent("onpropertychange", change);
        element.detachEvent("onblur", arguments.callee);
      });
      function change(event) {
        if (event.propertyName == "value") {
          element.scrollLeft = 9999;
        }
      };
    }
  },
  
  "@Safari.+theme=aqua": {
    layout: function(element) {
      this.syncCursor(element);
    }
  },
  
  createPopup: function() {
    return new Popup(this);
  },

  isActive: function(element) {
    return Chrome._popup && Chrome._popup.isOpen;
  },

  getState: function(element) {
    if (element.disabled) {
      var state = "disabled";
    } else if (element.readOnly) {
      state = "normal";
    } else if (element == Chrome._active && Chrome._activeThumb) {
      state = "active";
    } else if (element == Chrome._hover && Chrome._hoverThumb) {
      state = "hover";
    } else {
      state = "normal";
    }
    return this.states[state];
  }
});
