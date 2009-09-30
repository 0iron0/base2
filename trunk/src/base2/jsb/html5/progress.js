
_registerElement("progress", {
  detect: "max",

  display: "inline-block",
  
  "@Gecko": {
    display: "-moz-inline-box;display:inline-block"
  },

  style: {
    backgroundImage:      "url(%theme%/progressbar.png)!",
    backgroundPosition:   "9999px 9999px",
    backgroundAttachment: "scroll!",
    backgroundRepeat:     "no-repeat!",
    verticalAlign:        "-0.2em",
    width:                "10em",
    height:               "1em",
    boxSizing:            "border-box",
    textIndent:           "-100%",
    border:               "1px solid threeddarkshadow",
    borderRadius:         "5px",

    "@Opera8": {
      backgroundImage:    "url(themes/s/progressbar.png)!"
    }
  },

  behavior: ratio.extend({
    _CHUNK_SIZE: 1,    // some progress bars are shown in chunks
    _IMAGE_SIZE: 3000, // the actual size of the background image
    
    "@theme=luna": {
      _CHUNK_SIZE: 10  // luna themes use chunked progress bars
    },
    
    "@Opera8": {
      _IMAGE_SIZE: 2000
    },
    
    onattach: function(element) {
      if (element[_HEIGHT] > element[_WIDTH]) {
        this.setOrientation(element, "vertical");
      }
      this.layout(element);
    },

    layout: function(element) {
      var values = this.getRatio(element),
          relativeValue = values[_VALUE] / values[_MAX],
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
    },

    setOrientation: function(element, orientation) {
      if (orientation == "vertical") {
        var backgroundImage = this.getComputedStyle(element, "backgroundImage");
        this.setStyle(element, "backgroundImage", backgroundImage.replace(/\.png/i, "-vertical.png"), true);
      } else if (element.style.backgroundImage) {
        element.style.backgroundImage = "";
      }
    }
  })
});
