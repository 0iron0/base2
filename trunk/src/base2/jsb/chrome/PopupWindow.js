
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
        //this.element.value = this.originalValue;
        this.element.focus();
        //event.preventDefault();
        break;
      case 9: // tab
        if (this.tab(event.shiftKey ? -1 : 1)) event.preventDefault();
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
    ClassList.remove(document.body, "jsb-popupshowing");
  },

  render: function(html) {
    this.base(html);
    this.controls = this.querySelectorAll("button,input,select,textarea");
  },

  show: function(element) {
    ClassList.add(document.body, "jsb-popupshowing");
    this.base(element);
    //this.originalValue = this.element.value;
    PopupWindow.current = this;
  },

  tab: function(direction) {
    if (!this.controls.length) return false;
    var popup = this,
        element = popup.element,
        controls = this.controls.map(I),
        current = popup.querySelector(":focus") || element;
    popup._active = false;
    controls.unshift(element);
    controls.push(element);
    try {
      forEach (controls, function(control, i) {
        if (control == current) {
          var next = controls[i + direction];
          popup._active = next != element;
          next.focus();
          if (next.select) next.select();
          throw StopIteration;
        }
      });
    } catch (error) {
      ;;; if (error != StopIteration) throw error;
    }
    return true;
  }
}, {
  current: null,
  
  init: function() {
    var mousedown = true;
    EventTarget.addEventListener(window, "blur", hidePopup, true);
    EventTarget.addEventListener(document, "mousedown", hidePopup, true);
    EventTarget.addEventListener(document, "mouseup", function() {
      mousedown = false;
    }, true);
    function hidePopup(event) {
      var popup = PopupWindow.current,
          target = event.target;
          
      if (event.type == "blur" && mousedown) return;
      mousedown = event.type == "mousedown";
      
      if (popup && target != document && target != popup.element && target != shim.control && !Traversal.includes(popup.body, target)) {
        popup.hide();
      }
    };
  }
});
