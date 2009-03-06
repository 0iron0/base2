
var progress = behavior.extend({
  max: 1,
  value: 0,

  HEIGHT: 3000,
  WIDTH: 3000,
  CHUNK_WIDTH: 1,
  CHUNK_HEIGHT: 1,

  "@theme=luna": {
    CHUNK_WIDTH: 10,
    CHUNK_HEIGHT: 10
  },

  onattach: _progress_layout,
  onmaxchange: _progress_layout,
  onvaluechange: _progress_layout
});

function _progress_layout(element) {
  var max = this.get(element, "max"),
      value = this.get(element, "value"),
      relativeValue = value / max,
      clientWidth = element.clientWidth,
      clientHeight = element.clientHeight;

  if (clientHeight > clientWidth) {
    var left = (-clientWidth / 2) * (clientWidth + 3) - 2;
    var top = Math.floor(clientHeight * relativeValue);
    top = clientHeight - Math.round(top / this.CHUNK_HEIGHT) * this.CHUNK_HEIGHT;
  } else {
    left = Math.floor(clientWidth * relativeValue) - this.WIDTH;
    left = Math.round(left / this.CHUNK_WIDTH) * this.CHUNK_WIDTH;
    top = (-clientHeight / 2) * (clientHeight + 3) - 2;
  }

  element.style.backgroundPosition = left + "px " + top + "px";
};
