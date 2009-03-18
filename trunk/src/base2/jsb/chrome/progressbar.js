
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

  onmouseover: null,
  onmousemove: null,
  onmouseout: null,

  // methods

  hitTest: False,

  layout: function(element) {
    var clientWidth = element[_WIDTH] - 2,
        clientHeight = element[_HEIGHT] - 2,
        relativeValue = this.getProperties(element).relativeValue;

    if (clientHeight > clientWidth) {
      var left = (-clientWidth / 2) * (clientWidth + 3) - 2;
      var top = Math.floor(clientHeight * relativeValue);
      top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
    } else {
      left = Math.floor(clientWidth * relativeValue) - this.WIDTH;
      left = Math.round(left / this.CHUNK_WIDTH) * this.CHUNK_WIDTH;
      top = (-clientHeight / 2) * (clientHeight + 3) - 2;
    }
    
    element.style.backgroundPosition = ++left + PX + " " + ++top + PX;
  }
});
