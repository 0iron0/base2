
var PopupWindow = Popup.extend({
  constructor: function(owner) {
    this.base();
    this.owner = owner;
  },
  
  // properties

  controls: null,
  owner: null,
  scrollX: true,
  scrollY: true,
  
  // events

  onkeydown: function(event) {
    switch (event.keyCode) {
      case 27: // escape
        this.hide();
        break;
      case 9: // tab
        if (!this.tab(event.shiftKey ? -1 : 1)) event.preventDefault();
        break;
    }
  },
  
  // methods
  
  isActive: function() {
    return this._active || Element.matchesSelector(this.body, ":hover");
  },

  hide: function() {
    PopupWindow.current = null;
    forEach (this.controls, function(control) {
      if (control.blur) control.blur();
    });
    this.base();
  },

  show: function(element) {
    this.base(element);
    PopupWindow.current = this;
  },

  tab: function(direction) {
    if (!this.controls) return true;
    var popup = this,
        controls = this.controls.map(I),
        current = popup.querySelector(":focus");
    popup._active = false;
    controls.unshift(null);
    try {
      forEach (controls, function(control, i) {
        if (control == current) {
          var next = controls[i + direction];
          if (next) {
            popup._active = true;
            next.focus();
            if (next.select) next.select();
            throw StopIteration;
          } else {
            popup.element.focus();
          }
        }
      });
    } catch (ex) {}
    return !popup._active;
  }
}, {
  current: null,
  
  init: function() {
    EventTarget.addEventListener(window, "blur", hidePopup, false);
    EventTarget.addEventListener(document, "mousedown", hidePopup, false);
    function hidePopup(event) {
      var popup = PopupWindow.current,
          target = event.target;
      if (popup && target != document && target != popup.element && target != shim.control && !Traversal.contains(popup.body, target)) {
        popup.hide();
      }
    };
  }
});
