
_registerElement("progress", {
  detect: "max",

  display: "inline-block",
  
  "@Gecko": {
    display: "-moz-inline-box;display:inline-block"
  },

  style: {
    width: "8em"
    // additional styles are defined in jsb.chrome
  },

  behavior: {
    _CHUNK_SIZE: 1,    // some progress bars are shown in chunks
    _IMAGE_SIZE: 3000, // the actual size of the background image

    "@theme=luna": {
      _CHUNK_SIZE: 10  // luna themes use chunked progress bars
    },

    max: 1,
    value: 0,

    onattach: function(element) {
      this.layout(element);
    },

    onpropertyset: function(element, event, propertyName) {
      if (/^(max|value)$/.test(propertyName)) {
        this.layout(element);
      }
    },

    layout: function(element) {
      var relativeValue = this.get(element, "value") / this.get(element, "max"),
          clientWidth = element[_WIDTH],
          clientHeight = element[_HEIGHT];

      if (clientHeight > clientWidth) {
        var left = (-clientWidth / 2) * (clientWidth + 3) - 2,
            top = ~~(clientHeight * relativeValue);
        top = clientHeight - Math.round(top / this._CHUNK_SIZE) * this._CHUNK_SIZE;
      } else {
        left = ~~(clientWidth * relativeValue) - this._IMAGE_SIZE;
        left = Math.round(left / this._CHUNK_SIZE) * this._CHUNK_SIZE;
        top = (-clientHeight / 2) * (clientHeight + 3) - 2;
      }

      element.style.backgroundPosition = ~~left + "px " + ~~top + "px";
    }
  }
});
