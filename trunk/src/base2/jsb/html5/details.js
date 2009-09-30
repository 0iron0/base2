
_registerElement("details", {
  detect: "open",

  display: "block",

  // The real display is handled by the layout() method.
  // This speeds things up a little for CSS2 compliant browsers.
  extraStyles: {
    "details dt": { // should be :first-of-type but this targets more browsers
      paddingLeft:            "14px",
      backgroundPosition:     "1px center!",
      backgroundAttachment:   "scroll!",
      backgroundRepeat:       "no-repeat!"
    },

    "details > dt": {
      backgroundImage:        "url(images/arrow-down.png)"
    },

    "details[open] > dt": {
      backgroundImage:        "url(images/arrow-up.png)"
    },
    
    "@!MSIE[5-7]": {
      "details > dd": {
        overflow:               "hidden",
        height:                 0
      },

      "details[open] > dd": {
        height:                 "auto"
      }
    }
  },

  behavior: {
    open: false,

    oncontentready: function(element) {
      // Create a legend if the <dt> element is missing.
      var legend = this.querySelector(element, ">dt");
      if (!legend) {
        legend = document.createElement("dt");
        legend.innerHTML = "Details";
        element.insertBefore(legend, element.firstChild);
      }
      this.layout(element);
    },

    onclick: function(element, event, x) {
      // Toggle open state if the up/down-arrow is clicked.
      var legend = this.querySelector(element, ">dt");
      if (legend && Traversal.includes(legend, event.target) && x <= 14) {
        this.toggle(element, "open");
      }
    },

    onpropertyset: function(element, event, propertyName) {
      // If the "open" property is set then redraw.
      if (propertyName == "open") this.layout(element);
    },

    layout: function(element, state) {
      var open = this.get(element, "open"),
          legend = this.querySelector(element, ">dt"),
          content = this.querySelector(element, ">dd");
      if (legend) {
        this.setStyle(legend, "backgroundImage", "url(" + (open ? _OPEN_IMAGE : _CLOSED_IMAGE) + ")", true); // !important
      }
      if (content) {
        content.style.height = open ? "auto" : "0";
      }
    }
  }
});
