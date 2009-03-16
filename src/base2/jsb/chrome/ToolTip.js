
var ToolTip = Popup.extend({ // helper text for date controls
  appearance: "tooltip",
  text: "",

  hide: function() {
    this.base();
    ToolTip.current = null;
    clearTimeout(this._timeout);
  },

  render: function() {
    this.base('<div style="padding:2px">' + this.text + '</div>');
  },
  
  show: function(element, text) {
    // show the tooltip for 3 secs. If the user hovers over the tooltip (or the
    // original control itself) then pause for another 1 sec. After that, hide
    // the tootip.
    var tooltip = this;
    if (ToolTip.current) ToolTip.current.hide();
    tooltip.text = text;
    clearTimeout(tooltip._timeout);
    tooltip._timeout = setTimeout(function() {
      if (Element.matchesSelector(element, ":hover") || Element.matchesSelector(tooltip.body, ":hover")) {
        tooltip._timeout = setTimeout(arguments.callee, ToolTip.TIMEOUT / 3); // user is hovering over the control, pause before hiding
      } else {
        delete tooltip._timeout;
        tooltip.hide();
      }
    }, ToolTip.TIMEOUT);
    this.base(element); // default behaviour
    ToolTip.current = tooltip;
  }
}, {
  TIMEOUT: 3000,
  
  current: null
});
