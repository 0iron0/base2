
_registerElement("meter", {
  detect: "max",

  display: "inline-block",

  "@Gecko": {
    display: "-moz-inline-box;display:inline-block"
  },

  style: {
    verticalAlign: "-0.2em",
    backgroundColor: "inactivecaption",
    width: "5em",
    height: "1em",
    boxSizing: "border-box",
    textIndent: "-100%"
  },

  behavior: ratio.extend({
    min: 0,

    onattach: function(element) {
      this.layout(element);
    },

    layout: function(element) {
      var min = this.get(element, "min") || 0,
          values = this.getRatio(element),
          max = values[_MAX],
          value = values[_VALUE];
      value = value < min ? min : value > max ? max : (value - 0) || 0;
      var width = element[_WIDTH],
          height = element[_HEIGHT],
          isVertical = height > width,
          length = isVertical ? height : width,
          relativeValue =  (value - min) / (max - min),
          border = ~~(relativeValue * length) + "px solid",
          style = element.style;
      style.borderLeft = isVertical ? "" : border;
      style.borderBottom = isVertical ? border : "";
      if (!_SUPPORTS_BORDER_BOX) {
        var fixed = ~~(length - (relativeValue * length)) + "px";
        style.width = isVertical ? "" : fixed;
        style.height = isVertical ? fixed : "";
      }
    }
  })
});
