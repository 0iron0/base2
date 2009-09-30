
var ToolTip = Popup.extend({
  appearance: "tooltip",
  text: "",

  offsetX: 2,
  offsetY: 4,
  
  "@Safari": { // focus ring
    offsetY: 6
  },

  ontransitionend: function(event) {
    if (event.propertyName == "opacity" && event.target.style.opacity == "0") {
      this.removeBody();
    }
  },

  createBody: function() {
    var body = document.createElement("div");
    if (this.fadeIn != Undefined) {
      behavior.setStyle(body, "opacity", 0);
    }
    return body;
  },

  fadeIn: function() {
    behavior.animate(this.body, {opacity: 1});
  },

  fadeOut: function() {
    behavior.animate(this.body, {opacity: 0});
  },

  "@MSIE": {
    // Opacity is implemented using a CSS filter in MSIE.
    // This affects the rendering of text (it looks squidgy), so we turn it off.
    
    fadeIn: Undefined,
    
    fadeOut: function() {
      this.removeBody();
    }
  },

  hide: function() {
    if (this.isOpen()) this.fadeOut();
    delete this.element;
    ToolTip.current = null;
    clearTimeout(this._timeout);
  },

  render: function() {
    this.base('<div role="tooltip">' + this.text + '</div>');
  },
  
  show: function(element, text, duration) {
    // show the tooltip for 5 seconds.
    // If the user hovers over the tooltip (or the original control itself)
    // then don't hide the tooltip.
    duration = duration ? duration * 1000 : ToolTip.TIMEOUT;
    var tooltip = ToolTip.current = this;
    tooltip.text = text;
    if (tooltip._timeout) clearTimeout(tooltip._timeout);
    tooltip._timeout = setTimeout(function checkHoverState() {
      if (Element.matchesSelector(element, ":hover") || Element.matchesSelector(tooltip.body, ":hover")) {
        tooltip._timeout = setTimeout(checkHoverState, ToolTip.TIMEOUT / 3); // user is hovering over the control
      } else {
        delete tooltip._timeout;
        tooltip.hide();
      }
      duration = ToolTip.TIMEOUT;
    }, duration);
    this.base(element); // default behaviour
    this.fadeIn();
  }
}, {
  TIMEOUT: 5000,
  
  current: null
});
