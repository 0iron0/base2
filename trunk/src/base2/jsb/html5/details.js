
_registerElement("details", {
  detect: "open",

  display: "block",

//style: {
//  fontSize: "smaller"
//},

  extraStyles: {
    ".html5-details-notopen *": {
      display: "none!"
    },
    
    ".html5-details-notopen legend": {
      display: "block!"
    },
    
    ".html5-details-notopen legend *": {
      display: "inline!"
    },
    
    "details legend": {
      display: "block",
      cursor: "pointer",
      color: "windowtext",
      textDecoration: "underline",
      padding: 0
    }
  },

  behavior: {
    open: false,

    onclick: function(element, event) {
      var legend = this.querySelector(element, ">legend");
      if (legend && Traversal.includes(legend, event.target)) {
        this.toggle(element, "open");
      }
    },

    oncontentready: function(element) {
      // All of the following code is to fix rendering problems with current browsers. :(
      
      var fieldset = this.querySelector(element, ">fieldset:only-child");
      if (fieldset) { // Gecko inserts a fieldset when it finds a legend
        element.removeChild(fieldset);
        var nodes = fieldset.childNodes, node;
        while ((node = nodes[0])) {
          element.appendChild(node);
        }
      } else { // Make sure the legend is rendered
        var legend = this.querySelector(element, ">legend");
        // Make sure that the legend is a real element
        if (legend && !legend.canHaveChildren) {
          element.removeChild(legend);
          legend = null;
        }
        if (!legend) {
          legend = document.createElement("legend");
          element.insertBefore(legend, element.firstChild);
        }
        // If the legend has no text then create some
        if (!this.get(legend, "textContent")) {
          var i = 0, nodes = element.childNodes;
          while ((node = nodes[i++])) if (node == legend) break; // skip to the start of the legend element
          while ((node = nodes[i])) {
            if (node.nodeName == "/LEGEND") {
              // This is for MSIE, it's a redundant tag but it marks the end of the legend contents.
              element.removeChild(node);
              break;
            } else if (_BLOCK_START.test(node.nodeName)) {
              // We've reached the start of a new block.
              break;
            } else {
              // It's an inline node, append it to the legend element.
              legend.appendChild(node);
            }
          }
          if (!this.get(legend, "textContent")) {
            this.set(legend, "textContent", "Details"); // default text
          }
        }
      }
      this.layout(element);
    },

    onpropertyset: function(element, event, propertyName) {
      if (propertyName == "open") this.layout(element);
    },

    layout: function(element) {
      this[(this.get(element, "open") ? "remove" : "add") + "Class"](element, "html5-details-notopen");
    }
  }
});
