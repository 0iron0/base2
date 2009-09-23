
var progressbar = range.extend({
  // constants
  
  _CHUNK_SIZE: 1,

  "@theme=luna": {
    _CHUNK_SIZE: 10
  },

  // properties

  appearance: "progressbar",
  //role: "progressbar",

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
      var left = (-clientWidth / 2) * (clientWidth + 3) - 2,
          top = ~~(clientHeight * relativeValue);
      top = clientHeight - Math.round(top / this._CHUNK_SIZE) * this._CHUNK_SIZE;
    } else {
      left = ~~(clientWidth * relativeValue) - this._IMAGE_SIZE;
      left = Math.round(left / this._CHUNK_SIZE) * this._CHUNK_SIZE;
      top = (-clientHeight / 2) * (clientHeight + 3) - 2;
    }

    element.style.backgroundPosition = ++left + PX + " " + ++top + PX;
  }
});
