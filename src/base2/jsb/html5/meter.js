
_registerElement("meter", {
  detect: "max",

  display: "inline-block",

  "@Gecko": {
    display: "-moz-inline-box;display:inline-block"
  },

  style: {
    verticalAlign: "middle",
    backgroundColor: "ThreeDFace",
    border: "1px solid",
    padding: "0 2px",
    fontSize: "smaller",
    width: "8em",
    overflow: "hidden",
    textOverflow: "ellipsis",
    boxSizing: "border-box"
  },

  behavior: {
    max: 1,
    min: 0,
    value: 0,

    onattach: function(element) {
      this.layout(element);
    },

    onpropertyset: function(element, event, propertyName) {
      if (/^(max|min|value)$/.test(propertyName)) {
        this.layout(element);
      }
    },

    layout: function(element) {
      var min = this.get(element, "min"),
          relativeValue = (this.get(element, "value") - min) / (this.get(element, "max") - min),
          width = element[_WIDTH];
      element.style.borderLeftWidth = ~~(relativeValue * width) + "px";
      if (!_SUPPORTS_BORDER_BOX) {
        element.style.width = ~~(width - (relativeValue * width)) + "px";
      }
    }
  }
});
