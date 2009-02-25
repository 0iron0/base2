
// The progress bar uses a value between 0 and 1 and it is up to the consumer to
// map this to a valid value range

// TODO: Right to left should invert horizontal

var progressbar = range.extend({
  // constants
  
  HEIGHT: 3000,
  WIDTH: 3000,
  CHUNK_WIDTH: 1,
  CHUNK_HEIGHT: 1,
  
  "@theme=luna": {
    CHUNK_WIDTH: 10,
    CHUNK_HEIGHT: 10
  },

  // properties

  appearance: "progressbar",

  // events

  onmouseover: Undefined,
  onmouseout: Undefined,

  // methods

  hitTest: False,

  layout: function(element) {
    var clientWidth = element[_WIDTH],
        clientHeight = element[_HEIGHT],
        relativeValue = this.getProperties(element).relativeValue;

    if (clientHeight > clientWidth) {
      var left = (-clientWidth / 2) * (clientWidth + 3) - 2;
      //var left = (-clientWidth / 2) * (clientWidth - 1);
      var top = Math.floor(clientHeight * relativeValue);
      top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
    } else {
      left = Math.floor(clientWidth * relativeValue) - this.WIDTH;
      left = Math.round(left / this.CHUNK_WIDTH) * this.CHUNK_WIDTH;
      top = (-clientHeight / 2) * (clientHeight + 3) - 2;
      //top = (-clientHeight / 2) * (clientHeight - 1);
    }
    element.style.backgroundPosition = left + PX + " " + top + PX;
  }
});
